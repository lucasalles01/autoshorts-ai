import React from 'react';
import { AutoShortsLogo } from '../components/AutoShortsLogo';
import { WaitlistSection } from '../components/WaitlistSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cyber-dark text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-cyber-dark to-cyber-dark" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-4">
              <AutoShortsLogo size={64} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
              Crie Vídeos Virais com
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}Inteligência Artificial
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Transforme vídeos longos em múltiplos Shorts, Reels e TikToks automaticamente. 
              Edição profissional em segundos, não em horas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all">
                Começar Gratuitamente
              </button>
              <button className="px-8 py-4 rounded-xl font-bold text-white border border-violet-500/50 hover:bg-violet-950/30 transition-all">
                Ver Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Recursos Poderosos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'IA de Edição',
              description: 'Algoritmos avançados detectam os melhores momentos e criam cortes perfeitos'
            },
            {
              title: 'Legendas Automáticas',
              description: 'Transcrição e legendas animadas em múltiplos estilos'
            },
            {
              title: 'Multi-plataforma',
              description: 'Publique simultaneamente em TikTok, Instagram e YouTube'
            }
          ].map((feature, index) => (
            <div key={index} className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <WaitlistSection />
      </div>

      {/* Footer */}
      <div className="border-t border-cyber-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <AutoShortsLogo size={32} />
              <span className="text-white font-bold">AutoShorts AI</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 AutoShorts AI. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};