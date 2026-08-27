import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronRight, Search, Check, X, Video, CreditCard, Share2, Zap, ShieldCheck } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Funcionamento',
    question: 'Como funciona o AutoShorts AI?',
    answer: 'O AutoShorts AI usa inteligência artificial para analisar seus vídeos longos, detectar os melhores momentos e gerar automaticamente cortes verticais otimizados para TikTok, Instagram Reels e YouTube Shorts. O sistema transcreve o áudio, adiciona legendas automáticas e faz o reenquadramento inteligente.'
  },
  {
    category: 'Funcionamento',
    question: 'Quais formatos de vídeo são aceitos?',
    answer: 'Aceitamos MP4, MOV, AVI e outros formatos comuns de vídeo. Para melhor qualidade, recomendamos vídeos em 1080p com áudio claro. O tamanho máximo recomendado é 500MB por upload.'
  },
  {
    category: 'Funcionamento',
    question: 'Quanto tempo demora o processamento?',
    answer: 'O tempo varia conforme o tamanho do vídeo e a quantidade de cortes solicitados. Em média, vídeos de 10 minutos gerando 5 cortes levam cerca de 3-5 minutos. Vídeos mais longos podem levar mais tempo.'
  },
  {
    category: 'Direitos Autorais',
    question: 'Quais os direitos autorais sobre os vídeos?',
    answer: 'Você mantém todos os direitos sobre o conteúdo que carrega. O AutoShorts AI é uma ferramenta de edição e processamento. Nós não reivindicamos seu conteúdo. Você é responsável por garantir que tem os direitos necessários para usar o material.'
  },
  {
    category: 'Direitos Autorais',
    question: 'Posso usar qualquer conteúdo?',
    answer: 'Recomendamos usar apenas conteúdo que você tenha permissão para usar. Isso inclui vídeos originais, material licenciado Creative Commons, ou conteúdo que você criou. Respeite sempre os direitos autorais de terceiros.'
  },
  {
    category: 'Créditos',
    question: 'Como funcionam os créditos?',
    answer: 'Cada plano vem com uma quantidade de minutos de processamento. Cada minuto de vídeo processado consome 1 crédito. Você pode comprar créditos adicionais ou upgrade seu plano a qualquer momento.'
  },
  {
    category: 'Créditos',
    question: 'Os créditos expiram?',
    answer: 'Sim, os créditos têm validade de 30 dias após a compra. Os créditos do plano mensal são renovados automaticamente. Créditos comprados separadamente seguem a mesma regra.'
  },
  {
    category: 'Publicação',
    question: 'Como funciona a publicação nas redes sociais?',
    answer: 'Conecte suas contas do TikTok, Instagram e YouTube através das APIs oficiais. Após aprovar os cortes, você pode agendar publicações ou publicar imediatamente. O sistema gerencia automaticamente cada plataforma.'
  },
  {
    category: 'Publicação',
    question: 'Posso publicar em todas as redes ao mesmo tempo?',
    answer: 'Sim! Com o recurso de publicação multi-plataforma, você pode selecionar TikTok, Instagram Reels e YouTube Shorts e publicar o mesmo corte em todas as redes com um único clique.'
  },
  {
    category: 'Tecnologia',
    question: 'Que tecnologias vocês usam?',
    answer: 'Usamos OpenAI para transcrição e sugestões de conteúdo, FFmpeg para processamento de vídeo, APIs oficiais de cada plataforma para publicação, e infraestrutura moderna em Node.js e React.'
  },
  {
    category: 'Tecnologia',
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Usamos criptografia AES-256-GCM para proteger suas informações, incluindo tokens de acesso das redes sociais. Seguimos as melhores práticas de segurança e somos compatíveis com LGPD.'
  },
  {
    category: 'Suporte',
    question: 'Como posso entrar em contato com o suporte?',
    answer: 'Você pode entrar em contato através do email suporte@autoshorts.ai ou através do formulário de contato na página de Ajuda. Respondemos geralmente em até 24 horas úteis.'
  },
  {
    category: 'Suporte',
    question: 'Vocês oferecem reembolso?',
    answer: 'Sim, oferecemos reembolso dentro de 30 dias da compra para planos mensais. Entre em contato com o suporte para solicitar seu reembolso.'
  }
];

export const HelpCenterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>(faqData);

  const categories = ['all', ...new Set(faqData.map(faq => faq.category))];

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFAQs(faqData);
    } else {
      const filtered = faqData.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFAQs(filtered);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredFAQs(faqData);
    } else {
      setFilteredFAQs(faqData.filter(faq => faq.category === selectedCategory));
    }
  }, [selectedCategory]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Funcionamento':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'Direitos Autorais':
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
      case 'Créditos':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'Publicação':
        return <Share2 className="w-5 h-5 text-pink-500" />;
      case 'Tecnologia':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'Suporte':
        return <HelpCircle className="w-5 h-5 text-teal-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-gray-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-white">Central de Ajuda</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais frequentes sobre o AutoShorts AI
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar perguntas..."
            className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? 'Todas' : category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => {
            const isExpanded = expandedItems.has(index.toString());
            
            return (
              <div
                key={index}
                className="rounded-xl glass-panel border border-cyber-border overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(index.toString())}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-cyber-card transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(faq.category)}
                    <span className="font-medium text-white">{faq.question}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-cyber-border">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma pergunta encontrada para "{searchTerm}"</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="p-6 rounded-2xl glass-panel border border-violet-500/30 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Não encontrou sua resposta?</h3>
          <p className="text-gray-400">Entre em contato com nossa equipe de suporte.</p>
          <button className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all">
            Entrar em Contato
          </button>
        </div>
      </div>
    </div>
  );
};