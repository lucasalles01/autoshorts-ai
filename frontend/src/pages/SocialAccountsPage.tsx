import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { Share2, CheckCircle2, ShieldCheck, RefreshCw, Key, ExternalLink, Plus, Trash2, Lock, User, Chrome, Music, Youtube, X, Instagram } from 'lucide-react';

export const SocialAccountsPage: React.FC = () => {
  const { refreshAll } = useAppStore();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'oauth' | 'password'>('google');
  const [newAccount, setNewAccount] = useState({ 
    platform: 'TIKTOK', 
    username: '', 
    password: '',
    accessToken: '',
    googleEmail: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSocialAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTikTokLogin = async () => {
    try {
      const { authUrl } = await api.getTikTokAuthUrl();
      
      // Abrir popup para OAuth2 do TikTok
      const popup = window.open(authUrl, 'tiktok-oauth2-login', 'width=600,height=700');
      
      // Escutar mensagem do popup com o código
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth2-callback') {
          const { code, state, platform, error } = event.data;
          
          if (error) {
            popup?.close();
            alert(`Erro de autorização: ${error}`);
            return;
          }
          
          if (platform === 'TIKTOK') {
            // Enviar código para o backend
            api.handleTikTokCallback(code, state)
              .then((result) => {
                popup?.close();
                setShowAddModal(false);
                setNewAccount({ platform: 'TIKTOK', username: '', password: '', accessToken: '', googleEmail: '' });
                loadAccounts();
                refreshAll();
                alert(`Conta do TikTok conectada com sucesso! Usuário: ${result.username}`);
              })
              .catch((error) => {
                console.error('Erro ao processar OAuth2 TikTok:', error);
                popup?.close();
                alert('Erro ao conectar conta TikTok. Verifique se TIKTOK_CLIENT_KEY e TIKTOK_CLIENT_SECRET estão configurados no backend e se PUBLIC_BASE_URL está usando HTTPS.');
              });
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Limpar listener quando o popup fechar
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao iniciar login TikTok:', error);
      alert('Erro ao iniciar login TikTok. Verifique se TIKTOK_CLIENT_KEY está configurado no backend e se PUBLIC_BASE_URL está usando HTTPS.');
    }
  };

  const handleYouTubeLogin = async () => {
    try {
      const { authUrl } = await api.getYouTubeAuthUrl();
      
      // Abrir popup para OAuth2 do YouTube
      const popup = window.open(authUrl, 'youtube-oauth2-login', 'width=600,height=700');
      
      // Escutar mensagem do popup com o código
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth2-callback') {
          const { code, state, platform, error } = event.data;
          
          if (error) {
            popup?.close();
            alert(`Erro de autorização: ${error}`);
            return;
          }
          
          if (platform === 'YOUTUBE') {
            // Enviar código para o backend
            api.handleYouTubeCallback(code, state)
              .then((result) => {
                popup?.close();
                setShowAddModal(false);
                setNewAccount({ platform: 'YOUTUBE', username: '', password: '', accessToken: '', googleEmail: '' });
                loadAccounts();
                refreshAll();
                alert(`Conta do YouTube conectada com sucesso! Usuário: ${result.username}`);
              })
              .catch((error) => {
                console.error('Erro ao processar OAuth2 YouTube:', error);
                popup?.close();
                alert('Erro ao conectar conta YouTube. Verifique se GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET estão configurados no backend e se PUBLIC_BASE_URL está usando HTTPS.');
              });
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Limpar listener quando o popup fechar
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao iniciar login YouTube:', error);
      alert('Erro ao iniciar login YouTube. Verifique se GOOGLE_CLIENT_ID está configurado no backend e se PUBLIC_BASE_URL está usando HTTPS.');
    }
  };

  const handleInstagramLogin = async () => {
    try {
      const { authUrl } = await api.getInstagramAuthUrl();
      
      // Abrir popup para OAuth2 do Instagram
      const popup = window.open(authUrl, 'instagram-oauth2-login', 'width=600,height=700');
      
      // Escutar mensagem do popup com o código
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth2-callback') {
          const { code, state, platform, error } = event.data;
          
          if (error) {
            popup?.close();
            alert(`Erro de autorização: ${error}`);
            return;
          }
          
          if (platform === 'INSTAGRAM') {
            // Enviar código para o backend
            api.handleInstagramCallback(code, state)
              .then((result) => {
                popup?.close();
                setShowAddModal(false);
                setNewAccount({ platform: 'INSTAGRAM', username: '', password: '', accessToken: '', googleEmail: '' });
                loadAccounts();
                refreshAll();
                alert(`Conta do Instagram conectada com sucesso! Usuário: ${result.username}`);
              })
              .catch((error) => {
                console.error('Erro ao processar OAuth2 Instagram:', error);
                popup?.close();
                alert('Erro ao conectar conta Instagram. Verifique se INSTAGRAM_APP_ID e INSTAGRAM_APP_SECRET estão configurados no backend e se PUBLIC_BASE_URL está usando HTTPS.');
              });
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Limpar listener quando o popup fechar
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao iniciar login Instagram:', error);
      alert('Erro ao iniciar login Instagram. Verifique se INSTAGRAM_APP_ID está configurado no backend e se PUBLIC_BASE_URL está usando HTTPS.');
    }
  };

  const handleAddAccount = async () => {
    try {
      let accountData;
      
      if (authMethod === 'password') {
        accountData = { 
          platform: newAccount.platform, 
          username: newAccount.username, 
          accessToken: newAccount.password,
          externalAccountId: newAccount.username 
        };
      } else {
        accountData = {
          platform: newAccount.platform,
          username: newAccount.username,
          accessToken: newAccount.accessToken,
          externalAccountId: newAccount.username
        };
      }

      await api.createSocialAccount(accountData);
      setShowAddModal(false);
      setNewAccount({ platform: 'TIKTOK', username: '', password: '', accessToken: '', googleEmail: '' });
      await loadAccounts();
      await refreshAll();
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      alert('Erro ao adicionar conta. Verifique os dados e tente novamente.');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta conta?')) return;
    
    try {
      await api.deleteSocialAccount(id);
      await loadAccounts();
      await refreshAll();
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      alert('Erro ao deletar conta. Tente novamente.');
    }
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'TIKTOK': return 'text-cyan-400 bg-cyan-950 border-cyan-500/30';
      case 'INSTAGRAM': return 'text-amber-400 bg-amber-950 border-amber-500/30';
      case 'YOUTUBE': return 'text-rose-400 bg-rose-950 border-rose-500/30';
      default: return 'text-gray-400 bg-gray-950 border-gray-500/30';
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'TIKTOK': return 'TikTok';
      case 'INSTAGRAM': return 'Instagram Reels';
      case 'YOUTUBE': return 'YouTube Shorts';
      default: return platform;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'TIKTOK': return '🎵';
      case 'INSTAGRAM': return '📸';
      case 'YOUTUBE': return '▶️';
      default: return '📱';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl font-extrabold text-white">Conexão Oficial com Redes Sociais</h2>
          </div>
          <p className="text-xs text-gray-400">
            As integrações utilizam autenticação OAuth2 e as APIs oficiais das plataformas. Seus tokens são criptografados no servidor via <strong>AES-256-GCM</strong> e nunca são expostos.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-4 py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Conta</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center glass-panel rounded-2xl">
          <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Carregando contas...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl space-y-4">
          <Share2 className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">Nenhuma conta conectada</h3>
          <p className="text-xs text-gray-500">Conecte suas contas sociais para começar a agendar publicações automáticas.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2 px-4 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-500 text-white"
          >
            Conectar Primeira Conta
          </button>
        </div>
      ) : (
        /* Account Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div key={acc.id} className="p-6 rounded-2xl glass-card border border-cyber-border space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getPlatformBadgeColor(acc.platform)}`}>
                  {getPlatformLabel(acc.platform)}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conectado
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-white">{acc.username}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {acc.lastSyncAt ? `Última sincronização: ${new Date(acc.lastSyncAt).toLocaleString('pt-BR')}` : 'Conectado recentemente'}
                </p>
              </div>

              <div className="pt-2 border-t border-cyber-border/60 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Token OAuth2 Válido
                </span>
                <div className="flex items-center gap-2">
                  <button className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reconectar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl p-6 w-full max-w-md space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Conectar Conta Social</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30">
                <p className="text-xs text-violet-300">
                  🔗 <strong>Login OAuth2 Real:</strong> Clique no botão abaixo para fazer login oficial da plataforma via Google com suporte a 2FA.
                </p>
              </div>

              <button
                onClick={handleTikTokLogin}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg flex items-center justify-center gap-2"
              >
                <Music className="w-5 h-5" />
                Entrar com TikTok via Google (PKCE)
              </button>

              <button
                onClick={handleYouTubeLogin}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg flex items-center justify-center gap-2"
              >
                <Youtube className="w-5 h-5" />
                Entrar com YouTube via Google (OAuth2)
              </button>

              <button
                onClick={handleInstagramLogin}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg flex items-center justify-center gap-2"
              >
                <Instagram className="w-5 h-5" />
                Entrar com Instagram (Meta)
              </button>

              <div className="text-center">
                <button
                  onClick={() => setAuthMethod('oauth')}
                  className="text-xs text-gray-400 hover:text-violet-400 underline"
                >
                  Ou usar token OAuth2 manualmente
                </button>
              </div>

              {authMethod === 'oauth' && (
                <div className="pt-4 border-t border-cyber-border space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">Plataforma</label>
                    <select
                      value={newAccount.platform}
                      onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                      className="w-full glass-input text-sm rounded-xl p-3 text-gray-200"
                    >
                      <option value="TIKTOK">TikTok</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="YOUTUBE">YouTube</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">Access Token OAuth2</label>
                    <input
                      type="text"
                      value={newAccount.accessToken}
                      onChange={(e) => setNewAccount({ ...newAccount, accessToken: e.target.value })}
                      className="w-full glass-input text-sm rounded-xl p-3 text-gray-200"
                      placeholder="Cole seu token OAuth2 aqui"
                    />
                  </div>

                  <button
                    onClick={handleAddAccount}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-violet-600 text-white shadow-lg"
                  >
                    Conectar com Token
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-cyber-border">
              <button
                onClick={() => setShowAddModal(false)}
                className="py-2.5 px-4 rounded-xl font-semibold text-sm glass-panel text-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
