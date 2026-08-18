import React, { useState } from 'react';
import { useAppStore, ClipItem } from '../store/useAppStore';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Type,
  Sparkles,
  Scissors,
  Share2,
  Calendar,
  CheckCircle2,
  Copy,
  Zap,
  UserCheck,
  Eye,
  ArrowLeft,
  X
} from 'lucide-react';

export const ClipReviewEditor: React.FC = () => {
  const { selectedClip, clips, setSelectedClip, setActiveTab, updateClipCaption, addScheduledPost, approveClip, rejectClip } = useAppStore();

  const clip: ClipItem = selectedClip || clips[0];

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'video' | 'captions' | 'metadata' | 'schedule'>('video');

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(clip?.duration || 60);
  const [framingMode, setFramingMode] = useState<'FACE_TRACKING' | 'SUBJECT_TRACKING' | 'CENTER_CROP'>('FACE_TRACKING');
  const [silenceRemoval, setSilenceRemoval] = useState<string>('MEDIUM');

  const [captionStyle, setCaptionStyle] = useState<'VIRAL' | 'MODERN' | 'MINIMAL' | 'PROFESSIONAL'>(clip?.captionStyle || 'VIRAL');
  const [captionText, setCaptionText] = useState<string>(clip?.captionText || clip?.quoteSnippet || '');
  const [primaryColor, setPrimaryColor] = useState<string>('#FFFFFF');
  const [highlightColor, setHighlightColor] = useState<string>('#FACC15');

  const [tiktokTitle, setTiktokTitle] = useState<string>(clip?.title || 'Título do vídeo');
  const [tiktokDesc, setTiktokDesc] = useState<string>('Descrição do vídeo #shorts #viral');

  const [igTitle, setIgTitle] = useState<string>(clip?.title || 'Título do vídeo');
  const [igDesc, setIgDesc] = useState<string>('Descrição do vídeo #reels #ia');

  const [ytTitle, setYTTitle] = useState<string>(clip?.title || 'Título do vídeo');

  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(['TIKTOK', 'INSTAGRAM', 'YOUTUBE']);
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  });

  // Initialize with clip data when clip changes
  React.useEffect(() => {
    if (clip) {
      setStartTime(0);
      setEndTime(clip.duration);
      setCaptionStyle(clip.captionStyle);
      setCaptionText(clip.captionText || clip.quoteSnippet);
      setTiktokTitle(clip.title);
      setIgTitle(clip.title);
      setYTTitle(clip.title);
    }
  }, [clip?.id, clip]);

  const handleSaveAndSchedule = () => {
    updateClipCaption(clip.id, captionText, captionStyle);
    addScheduledPost({
      id: `post-${Date.now()}`,
      clipId: clip.id,
      clipTitle: clip.title,
      platform: 'TIKTOK',
      scheduledAt: scheduledDate,
      status: 'SCHEDULED'
    });
    setActiveTab('queue');
  };

  const handleApprove = async () => {
    await approveClip(clip.id);
  };

  const handleReject = async () => {
    await rejectClip(clip.id);
    setActiveTab('dashboard');
  };

  if (!clip) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Scissors className="w-16 h-16 text-gray-400 mx-auto" />
          <p className="text-gray-400">Nenhum corte selecionado</p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="py-2 px-4 rounded-xl bg-violet-600 text-white font-semibold"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="py-2 px-4 rounded-xl text-xs font-semibold glass-panel text-gray-300 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-violet-600/90 text-white font-extrabold text-xs shadow-md">
            Holistic Score: {clip.score}/100
          </span>
          <button
            onClick={handleReject}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-red-600/90 text-white shadow-lg flex items-center gap-2 hover:bg-red-500"
          >
            <X className="w-4 h-4" />
            <span>Rejeitar</span>
          </button>
          <button
            onClick={handleApprove}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600/90 text-white shadow-lg flex items-center gap-2 hover:bg-emerald-500"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aprovar</span>
          </button>
          <button
            onClick={handleSaveAndSchedule}
            className="py-2.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aprovar & Agendar</span>
          </button>
        </div>
      </div>

      {/* Main Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 9:16 Vertical Video Preview (Col 5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-3xl border-4 border-cyber-border shadow-2xl overflow-hidden group">
            {/* Simulated Video Player */}
            <video
              src={clip.videoUrl}
              className="w-full h-full object-cover"
              controls={false}
              loop
              muted
            />

            {/* Smart Framing Bounding Box Overlay */}
            {framingMode === 'FACE_TRACKING' && (
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-44 h-44 border-2 border-dashed border-cyan-400/80 rounded-2xl flex flex-col justify-between p-2 pointer-events-none animate-pulse">
                <div className="flex justify-between">
                  <span className="w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <span className="w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                </div>
                <div className="text-[10px] font-bold text-cyan-400 bg-black/60 px-2 py-0.5 rounded text-center self-center backdrop-blur-md">
                  Face Tracking AI: (X: 0.52, Y: 0.35)
                </div>
                <div className="flex justify-between">
                  <span className="w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                  <span className="w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>
            )}

            {/* Dynamic Animated Captions Overlay */}
            <div className="absolute bottom-20 left-4 right-4 text-center pointer-events-none z-10">
              <div
                className={`inline-block px-4 py-2 rounded-xl backdrop-blur-md transition-all ${
                  captionStyle === 'VIRAL'
                    ? 'bg-black/80 font-black uppercase text-xl text-white tracking-wide border border-yellow-500/40 drop-shadow-lg'
                    : captionStyle === 'MODERN'
                    ? 'bg-cyan-950/80 font-bold text-lg text-cyan-300 border border-cyan-400/40'
                    : captionStyle === 'MINIMAL'
                    ? 'bg-black/60 text-sm text-gray-100 font-medium'
                    : 'bg-violet-950/80 font-semibold text-base text-violet-200 border border-violet-500/40'
                }`}
              >
                {captionText}
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xl transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
            </div>

            {/* 9:16 Safe Area Indicator Badge */}
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-gray-300 border border-white/10">
              9:16 (1080x1920) Safe Zone
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Enquadramento Clamp: <strong className="text-cyan-400">x = clamp(xCenter - w/2, 0, originalW - w)</strong>
          </p>
        </div>

        {/* Right: Controls & Tabs Pane (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tabs Bar */}
          <div className="flex border-b border-cyber-border text-xs font-bold">
            {[
              { id: 'video', label: 'Vídeo & Trimmer', icon: Scissors },
              { id: 'captions', label: 'Legendas Animadas', icon: Type },
              { id: 'metadata', label: 'Metadados IA', icon: Sparkles },
              { id: 'schedule', label: 'Agendamento', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeEditorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveEditorTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-all ${
                    isActive
                      ? 'border-violet-500 text-violet-400 bg-violet-950/20'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: VIDEO & TIMELINE TRIMMER */}
          {activeEditorTab === 'video' && (
            <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-6">
              <h3 className="text-sm font-bold text-white">Linha do Tempo & Recorte do Corte</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono text-gray-300">
                  <span>Início: <strong>{startTime}s</strong></span>
                  <span>Duração Final: <strong>{endTime - startTime}s</strong></span>
                  <span>Fim: <strong>{endTime}s</strong></span>
                </div>

                {/* Timeline Range Visualizer */}
                <div className="w-full bg-cyber-dark p-3 rounded-xl border border-cyber-border space-y-2">
                  <div className="h-10 bg-violet-950/50 rounded-lg relative border border-violet-500/30 flex items-center px-4">
                    <span className="text-[10px] text-violet-300 font-mono">Waveform de Áudio (Loudnorm -16 LUFS)</span>
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="range"
                      min={0}
                      max={clip.duration}
                      value={startTime}
                      onChange={(e) => setStartTime(Number(e.target.value))}
                      className="w-full accent-violet-600"
                    />
                    <input
                      type="range"
                      min={startTime + 5}
                      max={clip.duration}
                      value={endTime}
                      onChange={(e) => setEndTime(Number(e.target.value))}
                      className="w-full accent-violet-600"
                    />
                  </div>
                </div>
              </div>

              {/* Framing Mode Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-300">Modo de Enquadramento Inteligente (Smart Framing):</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'FACE_TRACKING', label: 'Face Tracking', desc: 'Rosto detectado no centro' },
                    { id: 'SUBJECT_TRACKING', label: 'Subject Focus', desc: 'Foco no objeto principal' },
                    { id: 'CENTER_CROP', label: 'Center Crop', desc: 'Recorte central seguro' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setFramingMode(m.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        framingMode === m.id
                          ? 'border-cyan-500 bg-cyan-950/30 text-white font-bold'
                          : 'border-cyber-border text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <p className="text-xs font-bold">{m.label}</p>
                      <p className="text-[10px] opacity-75 mt-1">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Silence Removal Sensitivity */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">Remoção Inteligente de Silêncio:</label>
                <select
                  value={silenceRemoval}
                  onChange={(e) => setSilenceRemoval(e.target.value)}
                  className="w-full glass-input text-xs rounded-xl p-3 text-gray-200"
                >
                  <option value="OFF">Desativado (Manter pausas originais)</option>
                  <option value="LIGHT">Leve (Remove silêncios &gt; 1.5s)</option>
                  <option value="MEDIUM">Médio (Remove silêncios &gt; 0.8s) — Recomendado</option>
                  <option value="AGGRESSIVE">Agressivo (Ritmo muito rápido)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: ANIMATED CAPTIONS */}
          {activeEditorTab === 'captions' && (
            <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-6">
              <h3 className="text-sm font-bold text-white">Personalização de Legendas Animadas</h3>

              {/* Caption Styles Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'VIRAL', label: 'VIRAL', color: 'border-yellow-500 text-yellow-400' },
                  { id: 'MODERN', label: 'MODERNO', color: 'border-cyan-500 text-cyan-400' },
                  { id: 'MINIMAL', label: 'MINIMAL', color: 'border-gray-400 text-gray-200' },
                  { id: 'PROFESSIONAL', label: 'PROFISSIONAL', color: 'border-violet-500 text-violet-400' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setCaptionStyle(st.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      captionStyle === st.id
                        ? `${st.color} bg-cyber-card font-extrabold shadow-lg`
                        : 'border-cyber-border text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-xs">{st.label}</span>
                  </button>
                ))}
              </div>

              {/* Caption Text Editor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">Texto das Legendas Sincronizadas:</label>
                <textarea
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  rows={3}
                  className="w-full glass-input text-xs rounded-xl p-3 text-gray-100 font-semibold focus:outline-none"
                />
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">Cor Principal do Texto:</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-cyber-border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-gray-300">{primaryColor}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300">Cor de Destaque (Words Highlight):</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="w-8 h-8 rounded border border-cyber-border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-gray-300">{highlightColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLATFORM METADATA */}
          {activeEditorTab === 'metadata' && (
            <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Metadados Gerados por IA por Rede Social</h3>
                <button className="py-1.5 px-3 rounded-lg bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-violet-600/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Regerar com IA</span>
                </button>
              </div>

              {/* TikTok Metadata */}
              <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-3">
                <h4 className="text-xs font-bold text-pink-400">Configuração TikTok</h4>
                <input
                  type="text"
                  value={tiktokTitle}
                  onChange={(e) => setTiktokTitle(e.target.value)}
                  className="w-full glass-input text-xs rounded-lg p-2.5 text-gray-200"
                />
                <textarea
                  value={tiktokDesc}
                  onChange={(e) => setTiktokDesc(e.target.value)}
                  rows={2}
                  className="w-full glass-input text-xs rounded-lg p-2.5 text-gray-200"
                />
              </div>

              {/* Instagram Metadata */}
              <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-3">
                <h4 className="text-xs font-bold text-amber-400">Configuração Instagram Reels</h4>
                <input
                  type="text"
                  value={igTitle}
                  onChange={(e) => setIgTitle(e.target.value)}
                  className="w-full glass-input text-xs rounded-lg p-2.5 text-gray-200"
                />
                <textarea
                  value={igDesc}
                  onChange={(e) => setIgDesc(e.target.value)}
                  rows={2}
                  className="w-full glass-input text-xs rounded-lg p-2.5 text-gray-200"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SCHEDULE */}
          {activeEditorTab === 'schedule' && (
            <div className="p-6 rounded-2xl glass-panel border border-cyber-border space-y-6">
              <h3 className="text-sm font-bold text-white">Agendamento & Distribuição Automática</h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">Data & Horário de Publicação (Fuso Horário do Usuário):</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full glass-input text-xs rounded-xl p-3 text-gray-200"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-gray-300">Publicar nas Contas Conectadas:</label>
                <div className="space-y-2">
                  {[
                    { id: 'TIKTOK', label: 'TikTok (@autoshorts_oficial)' },
                    { id: 'INSTAGRAM', label: 'Instagram Reels (@autoshorts.studio)' },
                    { id: 'YOUTUBE', label: 'YouTube Shorts (AutoShorts Studio Brasil)' }
                  ].map((acc) => (
                    <label key={acc.id} className="flex items-center gap-3 p-3 rounded-xl glass-card border border-cyber-border cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-violet-600" />
                      <span className="text-xs font-bold text-white">{acc.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
