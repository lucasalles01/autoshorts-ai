import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'landing_page' })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao cadastrar');
      }

      setShowSuccess(true);
      setEmail('');
      setName('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Você está na lista! 🎉</h3>
        <p className="text-gray-300">Receba atualizações exclusivas e descontos de lançamento.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl glass-panel border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-cyber-card to-cyber-dark space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
          <h2 className="text-2xl font-extrabold text-white">Lista de Espera Exclusiva</h2>
        </div>
        <p className="text-gray-400">
          Receba <span className="text-violet-400 font-semibold">desconto de 30%</span> no lançamento e atualizações exclusivas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Nome (opcional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full px-4 py-3 rounded-xl glass-input text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full px-4 py-3 rounded-xl glass-input text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Entrar na Lista de Espera
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>🔒 Seus dados estão seguros. Não enviamos spam.</p>
        <p>✨ Você pode sair da lista a qualquer momento.</p>
      </div>
    </div>
  );
};