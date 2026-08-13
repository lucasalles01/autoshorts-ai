import React, { useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { api, mapClipToStore, pollJob } from '../api/client';
import {
  Upload,
  Sparkles,
  FileVideo,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Play,
  Clock
} from 'lucide-react';

interface CandidateClip {
  id: string;
  title: string;
  score: number;
  hookScore: number;
  duration: number;
  reason: string;
  snippet: string;
  videoUrl?: string;
}

export const NewProjectWizard: React.FC = () => {
  const { setActiveTab, refreshAll, setCurrentProjectId, currentProjectId } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<number>(1);
  const [projectName, setProjectName] = useState('Meu Novo Projeto');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [approvedClips, setApprovedClips] = useState<string[]>([]);
  const [candidateClips, setCandidateClips] = useState<CandidateClip[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Configurações avançadas
  const [maxClips, setMaxClips] = useState(5);
  const [minClipDuration, setMinClipDuration] = useState(20);
  const [maxClipDuration, setMaxClipDuration] = useState(58);
  const [postsPerDay, setPostsPerDay] = useState(2);
  const [preferredTimes, setPreferredTimes] = useState(['12:00', '19:00']);
  const [targetPlatforms, setTargetPlatforms] = useState(['TIKTOK']);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const clipOptions = [5, 10, 15, 50, 100, 400];
  const durationOptions = [30, 45, 58, 90, 120, 180, 240];

  const sampleVideos = [
    { name: 'Podcast #023 — Entrevista sobre o Futuro da IA', duration: 6120, label: '01:42:00' },
    { name: 'Palestra Tech 2026 — Estratégias de Crescimento Viral', duration: 7800, label: '02:10:00' },
    { name: 'Entrevista com CEO — Inovação e Tecnologias Disruptivas', duration: 3510, label: '00:58:30' }
  ];

  const startProcessing = async () => {
    setError(null);
    setIsScanning(true);
    setScanProgress(5);
    setStep(2);

    try {
      const project = await api.createProject({
        name: projectName,
        description: selectedFile?.name || selectedSample || 'Projeto AutoShorts'
      });
      setCurrentProjectId(project.id);

      let jobId: string;

      if (selectedFile) {
        const result = await api.uploadVideo(project.id, selectedFile);
        jobId = result.jobId;
      } else {
        const sample = sampleVideos.find((s) => s.name === selectedSample);
        const result = await api.startDemoProcessing(project.id, {
          name: selectedSample || 'demo.mp4',
          duration: sample?.duration || 180,
          maxClips,
          minClipDuration,
          maxClipDuration
        });
        jobId = result.jobId;
      }

      await pollJob(jobId, setScanProgress);

      const clips = await api.getClips(project.id);
      const mapped = clips.map(mapClipToStore);
      
      // Classificação automática: seleciona os melhores cortes baseado no score
      const sortedByScore = [...mapped].sort((a, b) => b.score - a.score);
      const topClips = sortedByScore.slice(0, Math.min(maxClips, mapped.length));
      
      setCandidateClips(
        sortedByScore.map((c) => ({
          id: c.id,
          title: c.title,
          score: c.score,
          hookScore: c.hookScore,
          duration: c.duration,
          reason: c.reason,
          snippet: c.quoteSnippet,
          videoUrl: c.videoUrl
        }))
      );
      
      // Seleção automática baseada na classificação
      setApprovedClips(topClips.map((c) => c.id));
      setIsScanning(false);
      setStep(3);
      await refreshAll();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar vídeo');
      setIsScanning(false);
      setStep(1);
    }
  };

  const toggleCandidateSelection = (id: string) => {
    setApprovedClips((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (approvedClips.length === 0) {
      setError('Selecione pelo menos um corte');
      return;
    }

    if (targetPlatforms.length === 0) {
      setError('Selecione pelo menos uma plataforma');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.autoSchedule({
        clipIds: approvedClips,
        postsPerDay,
        preferredTimes,
        targetPlatforms
      });
      await refreshAll();
      setActiveTab('calendar');
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar publicações');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="p-6 rounded-2xl glass-panel border border-cyber-border">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyber-border -z-0 -translate-y-1/2" />
          {[
            { s: 1, label: 'Upload do Vídeo' },
            { s: 2, label: 'Análise de IA' },
            { s: 3, label: 'Seleção dos Cortes' },
            { s: 4, label: 'Configuração em Lote' }
          ].map((item) => (
            <div key={item.s} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full font-extrabold text-sm flex items-center justify-center transition-all ${
                  step === item.s
                    ? 'bg-violet-600 text-white ring-4 ring-violet-500/30 neon-glow-violet'
                    : step > item.s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-cyber-card text-gray-400 border border-cyber-border'
                }`}
              >
                {step > item.s ? <CheckCircle2 className="w-5 h-5" /> : item.s}
              </div>
              <span className={`text-xs font-semibold ${step === item.s ? 'text-violet-400 font-bold' : step > item.s ? 'text-emerald-400' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl glass-panel border border-cyber-border">
            <label className="text-xs font-bold text-gray-300 block mb-2">Nome do Projeto</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full glass-input text-sm rounded-xl p-3 text-gray-200"
              placeholder="Ex: Podcast #024 — Marketing Digital"
            />
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl glass-panel border border-dashed border-violet-500/40 text-center space-y-4 hover:border-violet-500 transition-colors cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setSelectedSample(null);
                  setProjectName(file.name.replace(/\.[^.]+$/, ''));
                }
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto neon-glow-violet">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {selectedFile ? selectedFile.name : 'Arraste seu Vídeo Bruto para Iniciar'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">Suporta MP4, MOV ou AVI de até 500 MB</p>
            </div>
            <button type="button" className="py-2.5 px-6 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white shadow-md inline-block">
              Selecionar Vídeo do Computador
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ou escolha um vídeo de exemplo:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleVideos.map((s) => (
                <div
                  key={s.name}
                  onClick={() => {
                    setSelectedSample(s.name);
                    setSelectedFile(null);
                    setProjectName(s.name);
                  }}
                  className={`p-4 rounded-xl border glass-card cursor-pointer transition-all ${
                    selectedSample === s.name ? 'border-violet-500 bg-violet-950/30' : 'border-cyber-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileVideo className="w-5 h-5 text-violet-400 shrink-0" />
                    <h4 className="text-xs font-bold text-white line-clamp-2">{s.name}</h4>
                  </div>
                  <div className="text-[11px] text-gray-400 pt-2 border-t border-cyber-border/60">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Configurações Avançadas */}
          <div className="p-4 rounded-xl glass-panel border border-cyber-border space-y-4">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-bold text-gray-300">⚙️ Configurações Avançadas</span>
              <span className="text-xs text-violet-400">{showAdvancedSettings ? '▼' : '▶'}</span>
            </button>
            
            {showAdvancedSettings && (
              <div className="space-y-4 pt-4 border-t border-cyber-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">Número de Cortes</label>
                    <select
                      value={maxClips}
                      onChange={(e) => setMaxClips(Number(e.target.value))}
                      className="w-full glass-input text-sm rounded-xl p-3 text-gray-200"
                    >
                      {clipOptions.map((num) => (
                        <option key={num} value={num}>{num} cortes</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">Posts por Dia</label>
                    <select
                      value={postsPerDay}
                      onChange={(e) => setPostsPerDay(Number(e.target.value))}
                      className="w-full glass-input text-sm rounded-xl p-3 text-gray-200"
                    >
                      <option value={1}>1 post/dia</option>
                      <option value={2}>2 posts/dia</option>
                      <option value={3}>3 posts/dia</option>
                      <option value={4}>4 posts/dia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">Duração Mínima (segundos)</label>
                    <select
                      value={minClipDuration}
                      onChange={(e) => setMinClipDuration(Number(e.target.value))}
                      className="w-full glass-input text-sm rounded-xl p-3 text-gray-200"
                    >
                      <option value={15}>15 segundos</option>
                      <option value={20}>20 segundos</option>
                      <option value={30}>30 segundos</option>
                      <option value={45}>45 segundos</option>
                      <option value={60}>60 segundos</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">Duração Máxima (segundos)</label>
                    <select
                      value={maxClipDuration}
                      onChange={(e) => setMaxClipDuration(Number(e.target.value))}
                      className="w-full glass-input text-sm rounded-xl p-3 text-gray-200"
                    >
                      {durationOptions.map((dur) => (
                        <option key={dur} value={dur}>{dur} segundos</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2">Horários de Publicação</label>
                  <div className="flex gap-2">
                    {['09:00', '12:00', '15:00', '18:00', '19:00', '21:00'].map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          if (preferredTimes.includes(time)) {
                            setPreferredTimes(preferredTimes.filter(t => t !== time));
                          } else if (preferredTimes.length < 4) {
                            setPreferredTimes([...preferredTimes, time]);
                          }
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          preferredTimes.includes(time)
                            ? 'bg-violet-600 text-white'
                            : 'glass-panel text-gray-400 hover:text-white'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2">Plataformas</label>
                  <div className="flex gap-2">
                    {['TIKTOK', 'INSTAGRAM', 'YOUTUBE'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => {
                          if (targetPlatforms.includes(platform)) {
                            setTargetPlatforms(targetPlatforms.filter(p => p !== platform));
                          } else {
                            setTargetPlatforms([...targetPlatforms, platform]);
                          }
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          targetPlatforms.includes(platform)
                            ? 'bg-violet-600 text-white'
                            : 'glass-panel text-gray-400 hover:text-white'
                        }`}
                      >
                        {platform === 'TIKTOK' ? '🎵 TikTok' : platform === 'INSTAGRAM' ? '📸 Instagram' : '▶️ YouTube'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={startProcessing}
              disabled={!selectedFile && !selectedSample}
              className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Avançar para Análise de IA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-12 rounded-2xl glass-panel border border-cyan-500/30 text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto neon-glow-cyan animate-pulse">
            <Sparkles className="w-10 h-10 animate-spin" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-white">A IA está escaneando seu vídeo...</h2>
            <p className="text-xs text-gray-400">Transcrevendo, detectando ganchos e gerando cortes virais.</p>
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-cyan-400">Progresso</span>
              <span className="text-white font-mono">{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden p-0.5 border border-cyber-border">
              <div className="bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white">{candidateClips.length} Cortes Encontrados</h2>
              <p className="text-xs text-gray-400">Selecione os momentos para produzir e agendar.</p>
            </div>
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              {approvedClips.length} Selecionados
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidateClips.map((c) => {
              const isSelected = approvedClips.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => toggleCandidateSelection(c.id)}
                  className={`rounded-2xl glass-card border cursor-pointer transition-all overflow-hidden ${
                    isSelected ? 'border-violet-500 bg-violet-950/20 ring-2 ring-violet-500/30' : 'border-cyber-border opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Video Preview */}
                  <div className="relative aspect-[9/16] bg-black flex items-center justify-center overflow-hidden">
                    {c.videoUrl ? (
                      <video 
                        src={c.videoUrl} 
                        className="w-full h-full object-cover opacity-80"
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-violet-600/30 flex items-center justify-center mx-auto">
                            <Play className="w-6 h-6 text-violet-400" />
                          </div>
                          <p className="text-xs text-gray-400">Processando...</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-black/40" />
                    
                    {/* Score Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-violet-600/90 text-white font-extrabold text-xs shadow-lg backdrop-blur-md border border-violet-400/40">
                      {c.score}/100
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-gray-200 font-mono text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{c.duration}s</span>
                    </div>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-sm text-white pr-2 line-clamp-2">{c.title}</h3>
                    </div>
                    <p className="text-xs text-gray-300 italic bg-cyber-dark/60 p-3 rounded-xl border border-cyber-border line-clamp-3">"{c.snippet}"</p>
                    <div className="text-xs text-violet-400 font-semibold">{c.reason}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-cyber-border">
            <button onClick={() => setStep(1)} className="py-2.5 px-5 rounded-xl font-semibold text-xs glass-panel text-gray-300 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={() => setStep(4)} className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg flex items-center gap-2">
              Avançar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-4">
            <h2 className="text-lg font-bold text-white">Agendar Publicações</h2>
            <p className="text-xs text-gray-400">
              {approvedClips.length} cortes serão agendados automaticamente no TikTok, Instagram Reels e YouTube Shorts (2 posts/dia).
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-cyber-border">
            <button onClick={() => setStep(3)} className="py-2.5 px-5 rounded-xl font-semibold text-xs glass-panel text-gray-300 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Agendando...' : 'Gerar Cortes e Programar Calendário'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
