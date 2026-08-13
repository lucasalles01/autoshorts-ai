import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { prisma } from '../database/client.js';
import { fromJsonColumn } from '../database/serializers.js';
import { storageService } from '../storage/storage.service.js';

// Local enums
enum SocialPlatform {
  TIKTOK = "TIKTOK",
  YOUTUBE = "YOUTUBE",
  INSTAGRAM = "INSTAGRAM"
}

enum ScheduledPostStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  PUBLISHING = "PUBLISHING",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED"
}

export interface PublishPayload {
  clipId: string;
  videoFilePath: string;
  externalAccountId: string;
  title: string;
  description: string;
  hashtags: string[];
  publicVideoUrl?: string;
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  error?: string;
}

export interface SocialAdapter {
  platform: SocialPlatform;
  publish(accessToken: string, payload: PublishPayload): Promise<PublishResult>;
}

function buildCaption(payload: PublishPayload, maxLength: number): string {
  const tags = payload.hashtags.map((h) => `#${h.replace(/^#/, '')}`).join(' ');
  const full = `${payload.description}\n\n${tags}`.trim();
  return full.length > maxLength ? `${full.substring(0, maxLength - 3)}...` : full;
}

/** YouTube Data API v3 — upload resumável (Shorts = vídeo vertical de até 3 min). */
export class YouTubeAdapter implements SocialAdapter {
  public platform = SocialPlatform.YOUTUBE;

  public async publish(accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const stats = await fs.promises.stat(payload.videoFilePath);

    const metadata = {
      snippet: {
        title: payload.title.substring(0, 100),
        description: buildCaption(payload, 4900),
        tags: payload.hashtags.slice(0, 15),
        categoryId: '22'
      },
      status: {
        privacyStatus: env.YOUTUBE_PRIVACY_STATUS,
        selfDeclaredMadeForKids: false
      }
    };

    const initResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': String(stats.size),
          'X-Upload-Content-Type': 'video/mp4'
        },
        body: JSON.stringify(metadata)
      }
    );

    if (!initResponse.ok) {
      const detail = await initResponse.text().catch(() => '');
      return {
        success: false,
        error: `YouTube recusou o início do upload (${initResponse.status}): ${detail.substring(0, 300)}`
      };
    }

    const uploadUrl = initResponse.headers.get('location');
    if (!uploadUrl) {
      return { success: false, error: 'YouTube não retornou a URL de upload resumável.' };
    }

    const fileBuffer = await fs.promises.readFile(payload.videoFilePath);
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(stats.size)
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      const detail = await uploadResponse.text().catch(() => '');
      return {
        success: false,
        error: `Falha no envio do arquivo ao YouTube (${uploadResponse.status}): ${detail.substring(0, 300)}`
      };
    }

    const result: any = await uploadResponse.json();
    return { success: true, externalPostId: result.id };
  }
}

/** TikTok Content Posting API v2 — Direct Post com upload de arquivo. */
export class TikTokAdapter implements SocialAdapter {
  public platform = SocialPlatform.TIKTOK;

  public async publish(accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const stats = await fs.promises.stat(payload.videoFilePath);

    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({
        post_info: {
          title: buildCaption(payload, 2100),
          privacy_level: env.TIKTOK_PRIVACY_LEVEL,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: stats.size,
          chunk_size: stats.size,
          total_chunk_count: 1
        }
      })
    });

    const initData: any = await initResponse.json().catch(() => ({}));

    if (!initResponse.ok || initData?.error?.code !== 'ok') {
      return {
        success: false,
        error: `TikTok recusou a publicação: ${initData?.error?.message || initResponse.status}`
      };
    }

    const uploadUrl = initData?.data?.upload_url;
    const publishId = initData?.data?.publish_id;
    if (!uploadUrl) {
      return { success: false, error: 'TikTok não retornou a URL de upload.' };
    }

    const fileBuffer = await fs.promises.readFile(payload.videoFilePath);
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(stats.size),
        'Content-Range': `bytes 0-${stats.size - 1}/${stats.size}`
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      const detail = await uploadResponse.text().catch(() => '');
      return {
        success: false,
        error: `Falha no envio do arquivo ao TikTok (${uploadResponse.status}): ${detail.substring(0, 300)}`
      };
    }

    return { success: true, externalPostId: publishId };
  }
}

/** Instagram Graph API — Reels exige que o vídeo esteja em uma URL pública acessível. */
export class InstagramAdapter implements SocialAdapter {
  public platform = SocialPlatform.INSTAGRAM;

  private async wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async publish(accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    if (!payload.publicVideoUrl) {
      return {
        success: false,
        error:
          'O Instagram só aceita publicação a partir de uma URL pública. Configure PUBLIC_BASE_URL no .env com um endereço acessível pela internet.'
      };
    }

    const igUserId = payload.externalAccountId;
    const version = env.INSTAGRAM_API_VERSION;

    const containerResponse = await fetch(
      `https://graph.facebook.com/${version}/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: payload.publicVideoUrl,
          caption: buildCaption(payload, 2100),
          share_to_feed: true,
          access_token: accessToken
        })
      }
    );

    const containerData: any = await containerResponse.json().catch(() => ({}));
    if (!containerResponse.ok || !containerData.id) {
      return {
        success: false,
        error: `Instagram recusou o container: ${containerData?.error?.message || containerResponse.status}`
      };
    }

    // O Reels precisa terminar o processamento antes de publicar
    for (let attempt = 0; attempt < 20; attempt++) {
      await this.wait(3000);
      const statusResponse = await fetch(
        `https://graph.facebook.com/${version}/${containerData.id}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`
      );
      const statusData: any = await statusResponse.json().catch(() => ({}));
      if (statusData.status_code === 'FINISHED') break;
      if (statusData.status_code === 'ERROR') {
        return { success: false, error: 'O Instagram falhou ao processar o vídeo do Reels.' };
      }
      if (attempt === 19) {
        return { success: false, error: 'Tempo esgotado aguardando o Instagram processar o vídeo.' };
      }
    }

    const publishResponse = await fetch(
      `https://graph.facebook.com/${version}/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken })
      }
    );

    const publishData: any = await publishResponse.json().catch(() => ({}));
    if (!publishResponse.ok || !publishData.id) {
      return {
        success: false,
        error: `Instagram recusou a publicação: ${publishData?.error?.message || publishResponse.status}`
      };
    }

    return { success: true, externalPostId: publishData.id };
  }
}

export class SocialPublisherService {
  private adapters: Map<SocialPlatform, SocialAdapter>;

  constructor() {
    this.adapters = new Map();
    this.adapters.set(SocialPlatform.TIKTOK, new TikTokAdapter());
    this.adapters.set(SocialPlatform.INSTAGRAM, new InstagramAdapter());
    this.adapters.set(SocialPlatform.YOUTUBE, new YouTubeAdapter());
  }

  public encryptToken(token: string): string {
    try {
      const iv = crypto.randomBytes(12);
      const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      let encrypted = cipher.update(token, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Erro ao criptografar token:', error);
      // Fallback para encoding simples se criptografia falhar
      return Buffer.from(token).toString('base64');
    }
  }

  public decryptToken(encryptedString: string): string {
    try {
      // Tentar decodificar como formato criptografado
      const parts = encryptedString.split(':');
      if (parts.length === 3) {
        const [ivHex, authTagHex, encrypted] = parts;
        if (ivHex && authTagHex && encrypted) {
          const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
          const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
          decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
          let decrypted = decipher.update(encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          return decrypted;
        }
      }
      // Fallback para base64
      return Buffer.from(encryptedString, 'base64').toString('utf8');
    } catch (error) {
      console.error('Erro ao descriptografar token, usando como plaintext:', error);
      return encryptedString; // Retorna como plaintext se falhar
    }
  }

  /**
   * Publica um agendamento existente. Atualiza status, tentativas e erro no banco.
   * Contas marcadas como mock NUNCA reportam sucesso falso.
   */
  public async publishScheduledPost(postId: string): Promise<PublishResult> {
    const post = await prisma.scheduledPost.findUnique({
      where: { id: postId },
      include: { clip: { include: { metadatas: true } }, socialAccount: true }
    });

    if (!post) return { success: false, error: 'Agendamento não encontrado.' };

    if (post.status === ScheduledPostStatus.PUBLISHED) {
      return { success: true, externalPostId: post.externalPostId || undefined };
    }

    const fail = async (error: string): Promise<PublishResult> => {
      await prisma.scheduledPost.update({
        where: { id: postId },
        data: {
          status: ScheduledPostStatus.FAILED,
          lastError: error,
          attempts: post.attempts + 1
        }
      });
      return { success: false, error };
    };

    if (post.socialAccount.isMock) {
      return fail(
        `A conta ${post.socialAccount.platform} é apenas um exemplo local. Conecte uma conta real em "Contas Sociais" para publicar de verdade.`
      );
    }

    if (!post.clip.storageKey) {
      return fail('Este corte não possui arquivo renderizado.');
    }

    const videoFilePath = storageService.resolveKey(post.clip.storageKey);
    if (!fs.existsSync(videoFilePath)) {
      return fail(`Arquivo do corte não encontrado no disco: ${post.clip.storageKey}`);
    }

    const platform = post.socialAccount.platform as SocialPlatform;
    const adapter = this.adapters.get(platform);
    if (!adapter) return fail(`Plataforma ${platform} não suportada.`);

    const metadata =
      post.clip.metadatas.find((m) => m.platform === platform) || post.clip.metadatas[0];

    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: ScheduledPostStatus.PUBLISHING }
    });

    try {
      const accessToken = this.decryptToken(post.socialAccount.accessTokenEncrypted);

      const result = await adapter.publish(accessToken, {
        clipId: post.clip.id,
        videoFilePath,
        externalAccountId: post.socialAccount.externalAccountId,
        title: metadata?.title || `Corte ${post.clip.id.substring(0, 6)}`,
        description: metadata?.description || '',
        hashtags: fromJsonColumn<string[]>(metadata?.hashtags as any, []),
        publicVideoUrl: env.PUBLIC_BASE_URL
          ? `${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/api/files/clips/${path.basename(post.clip.storageKey)}`
          : undefined
      });

      if (!result.success) return fail(result.error || 'Falha desconhecida na publicação.');

      await prisma.scheduledPost.update({
        where: { id: postId },
        data: {
          status: ScheduledPostStatus.PUBLISHED,
          publishedAt: new Date(),
          externalPostId: result.externalPostId,
          lastError: null,
          attempts: post.attempts + 1
        }
      });

      return result;
    } catch (err: any) {
      return fail(`Erro ao publicar: ${err.message}`);
    }
  }
}

export const socialPublisherService = new SocialPublisherService();
