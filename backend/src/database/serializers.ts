/**
 * O SQLite não possui tipo Json nativo, portanto os campos estruturados são
 * persistidos como String JSON. Estes helpers convertem nas duas direções e
 * garantem que a API continue devolvendo objetos/arrays para o frontend.
 */

export function toJsonColumn(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function fromJsonColumn<T>(value: string | null | undefined, fallback: T): T {
  if (value === null || value === undefined || value === '') return fallback;
  try {
    const parsed = JSON.parse(value);
    return (parsed === null ? fallback : parsed) as T;
  } catch {
    return fallback;
  }
}

export function presentCaption(caption: any) {
  if (!caption) return caption;
  return {
    ...caption,
    highlightedWords: fromJsonColumn<string[]>(caption.highlightedWords, []),
    configuration: fromJsonColumn<Record<string, unknown>>(caption.configuration, {})
  };
}

export function presentMetadata(metadata: any) {
  if (!metadata) return metadata;
  return {
    ...metadata,
    hashtags: fromJsonColumn<string[]>(metadata.hashtags, [])
  };
}

export function presentClip(clip: any) {
  if (!clip) return clip;
  return {
    ...clip,
    framingData: fromJsonColumn<Record<string, unknown>>(clip.framingData, {}),
    captions: Array.isArray(clip.captions) ? clip.captions.map(presentCaption) : undefined,
    metadatas: Array.isArray(clip.metadatas) ? clip.metadatas.map(presentMetadata) : undefined
  };
}

export function presentTranscript(transcript: any) {
  if (!transcript) return transcript;
  return {
    ...transcript,
    segments: fromJsonColumn<unknown[]>(transcript.segments, []),
    words: fromJsonColumn<unknown[]>(transcript.words, [])
  };
}

/** Nunca expõe tokens OAuth para o cliente. */
export function presentSocialAccount(account: any) {
  if (!account) return account;
  const { accessTokenEncrypted, refreshTokenEncrypted, ...safe } = account;
  return {
    ...safe,
    scopes: fromJsonColumn<string[]>(account.scopes, []),
    platformMetadata: fromJsonColumn<Record<string, unknown> | null>(account.platformMetadata, null),
    hasCredentials: Boolean(accessTokenEncrypted)
  };
}

export function presentProject(project: any) {
  if (!project) return project;
  return {
    ...project,
    clips: Array.isArray(project.clips) ? project.clips.map(presentClip) : undefined
  };
}

export function presentScheduledPost(post: any) {
  if (!post) return post;
  return {
    ...post,
    clip: post.clip ? presentClip(post.clip) : undefined,
    socialAccount: post.socialAccount ? presentSocialAccount(post.socialAccount) : undefined
  };
}
