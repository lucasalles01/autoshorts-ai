import React, { useEffect } from 'react';

export const OAuthCallback: React.FC = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    // Detectar plataforma baseado na URL ou parâmetros
    const isTikTok = window.location.href.includes('tiktok') || urlParams.get('platform') === 'TIKTOK';
    const isYouTube = window.location.href.includes('youtube') || urlParams.get('platform') === 'YOUTUBE';
    const isInstagram = window.location.href.includes('instagram') || urlParams.get('platform') === 'INSTAGRAM';
    
    let platform = 'TIKTOK';
    if (isYouTube) platform = 'YOUTUBE';
    else if (isInstagram) platform = 'INSTAGRAM';

    if (error) {
      // Se houver erro, enviar erro para o parent window
      window.opener?.postMessage({
        type: 'oauth2-callback',
        error,
        platform
      }, window.location.origin);
      
      setTimeout(() => {
        window.close();
      }, 500);
      return;
    }

    if (code) {
      // Enviar código para o parent window
      window.opener?.postMessage({
        type: 'oauth2-callback',
        code,
        state,
        platform
      }, window.location.origin);
      
      // Fechar o popup após enviar
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      // Se não houver código, mostrar erro
      document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f0f1a; color: white; font-family: sans-serif;">
          <h1 style="color: #ef4444;">Erro na Autenticação</h1>
          <p>Nenhum código de autorização recebido.</p>
          <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer;">Fechar</button>
        </div>
      `;
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f1a', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #7c3aed', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p>Processando autenticação...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};
