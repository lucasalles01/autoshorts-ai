import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';

interface ExitIntentPopupProps {
  onClose: () => void;
  onJoinWaitlist: (email: string) => void;
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ onClose, onJoinWaitlist }) => {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('exitIntentShown');
    if (hasSeenPopup) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect when mouse leaves viewport from top
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Add event listener for mouse leaving viewport
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onJoinWaitlist(email);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-md w-full bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 rounded-3xl p-8 shadow-2xl border border-violet-500/30">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                <Gift className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">
              Espere! 🎉
            </h2>
            <p className="text-lg font-semibold text-yellow-300">
              50% OFF no primeiro mês!
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-200 text-sm leading-relaxed">
            Entre na nossa lista de espera e garanta <strong className="text-yellow-300">50% de desconto</strong> no primeiro mês do AutoShorts AI. Oferta limitada!
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {['✨ Geração automática', '🎬 Cortes inteligentes', '📱 Multi-plataforma'].map((feature) => (
              <span key={feature} className="px-3 py-1.5 rounded-full bg-white/10 text-white backdrop-blur-sm">
                {feature}
              </span>
            ))}
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Quero meu desconto!</span>
            </button>
          </form>

          {/* Trust Elements */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒 Seu e-mail está seguro</span>
            <span>•</span>
            <span>Sem spam</span>
          </div>

          {/* No Thanks */}
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition-colors underline"
          >
            Não, obrigado. Prefiro pagar o preço cheio.
          </button>
        </div>
      </div>
    </div>
  );
};