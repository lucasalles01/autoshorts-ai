import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Crown, Star, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
}

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPlansAndCredits();
  }, []);

  const loadPlansAndCredits = async () => {
    setLoading(true);
    try {
      const [plansData, creditsData] = await Promise.all([
        api.getPaymentPlans(),
        api.getUserCredits()
      ]);
      
      setPlans(plansData);
      setUserCredits(creditsData.credits);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      const response = await api.createPaymentIntent(planId);

      // Em produção, aqui redirecionaria para o checkout do Stripe/Mercado Pago
      // Por enquanto, simulamos o sucesso
      alert(`Redirecionando para checkout do plano ${planId}...\n\nEm produção, isso abriria o checkout do Stripe/Mercado Pago.`);
      
      // Simular sucesso
      setUserCredits(prev => prev + plans.find(p => p.id === planId)?.credits || 0);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      alert('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter':
        return <Zap className="w-8 h-8 text-blue-400" />;
      case 'pro':
        return <Star className="w-8 h-8 text-purple-400" />;
      case 'enterprise':
        return <Crown className="w-8 h-8 text-amber-400" />;
      default:
        return <CreditCard className="w-8 h-8 text-gray-400" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'starter':
        return 'from-blue-600 to-cyan-600';
      case 'pro':
        return 'from-purple-600 to-indigo-600';
      case 'enterprise':
        return 'from-amber-600 to-orange-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-white">Planos e Créditos</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Escolha o plano ideal para suas necessidades. Mais créditos = mais vídeos processados.
        </p>
      </div>

      {/* Credits Display */}
      <div className="max-w-md mx-auto p-6 rounded-2xl glass-panel border border-violet-500/30 text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <CreditCard className="w-8 h-8 text-violet-400" />
          <h2 className="text-xl font-bold text-white">Seus Créditos Atuais</h2>
        </div>
        <p className="text-5xl font-extrabold text-violet-400">{userCredits}</p>
        <p className="text-sm text-gray-400">Minutos de processamento disponíveis</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-2xl glass-panel border-2 transition-all ${
              selectedPlan === plan.id
                ? 'border-violet-500 scale-105'
                : 'border-cyber-border hover:border-violet-500/50'
            }`}
          >
            {plan.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-full">
                MAIS POPULAR
              </div>
            )}

            <div className="text-center space-y-4 mb-6">
              <div className="flex justify-center">
                {getPlanIcon(plan.id)}
              </div>
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <div className="space-y-1">
                <p className="text-4xl font-extrabold text-white">
                  R$ {plan.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">por mês</p>
              </div>
              <div className="pt-4 border-t border-cyber-border">
                <p className="text-3xl font-bold text-violet-400">{plan.credits}</p>
                <p className="text-xs text-gray-400">minutos de processamento</p>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={isProcessing}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isProcessing && selectedPlan === plan.id
                  ? 'bg-gray-600 cursor-not-allowed'
                  : `bg-gradient-to-r ${getPlanColor(plan.id)} hover:opacity-90`
              }`}
            >
              {isProcessing && selectedPlan === plan.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Assinar Agora
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Additional Credits */}
      <div className="max-w-2xl mx-auto p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
        <h3 className="text-lg font-bold text-white text-center">Precisa de Mais Créditos?</h3>
        <p className="text-sm text-gray-400 text-center">
          Compre créditos adicionais sem compromisso de plano.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { credits: 50, price: 19.90 },
            { credits: 100, price: 34.90 },
            { credits: 250, price: 79.90 }
          ].map((option, index) => (
            <button
              key={index}
              className="p-4 rounded-xl bg-cyber-dark border border-cyber-border hover:border-violet-500/50 transition-colors"
            >
              <p className="text-2xl font-bold text-white">{option.credits}</p>
              <p className="text-xs text-gray-400">minutos</p>
              <p className="text-lg font-bold text-violet-400 mt-2">R$ {option.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-xs text-gray-500 space-y-2">
        <p>• Créditos são válidos por 30 dias após a compra</p>
        <p>• Cancelamento a qualquer momento sem multa</p>
        <p>• Suporte por email para todos os planos</p>
      </div>
    </div>
  );
};