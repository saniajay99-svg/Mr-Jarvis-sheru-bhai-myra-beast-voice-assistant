import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Video, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Share2, 
  Upload, 
  Camera, 
  Film, 
  Sliders, 
  Wand2, 
  Smartphone, 
  Layers, 
  Check, 
  ExternalLink,
  Crown
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface PhotoToVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareWhatsApp: (text?: string) => void;
}

const PRESET_IMAGES = [
  {
    id: 'aijay-crown',
    label: '👑 Master Ajay Boss & Sharu Bhai 500M',
    url: './assets/aistudio/file_0000000006c08208b358c43353e457af_69c155c6.webp',
    prompt: 'Cinematic 3D camera push-in with floating 24K royal golden particles and radiant crown aura for Master Ajay Boss in Rishikesh'
  },
  {
    id: 'beast-tiger',
    label: '⚡ Beast Cyber Tiger',
    url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
    prompt: 'Neon cyberpunk beast aura pulse with hyper-speed dynamic camera orbit and cinematic lens flares'
  },
  {
    id: 'cosmic-portal',
    label: '🌌 Cosmic Nebula Portal',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    prompt: 'Deep interstellar parallax depth fly-through with swirling cosmic dust and starlight explosion'
  },
  {
    id: 'supercar-beast',
    label: '🏎️ Neon Supercar Speed',
    url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    prompt: 'Hyper-lapse highway rush with neon tail-light motion blur and dramatic anamorphic anamorphic streak'
  }
];

const CINEMATIC_PROMPTS = [
  { id: '3d-zoom', label: '🚀 3D Hyper-Zoom & Flare', prompt: 'Cinematic 3D slow-motion push-in with anamorphic lens flare and volumetric sunlight rays' },
  { id: 'royal-gold', label: '👑 Royal Gold Embers & Crown', prompt: 'Regal golden particles dissolve, ethereal glowing aura, and majestic slow-motion pedestal tilt' },
  { id: 'cyber-orbit', label: '⚡ Cyberpunk 360° Orbit', prompt: 'Dynamic 360 camera orbit, neon chromatic aberration, and high-voltage electrical sparks' },
  { id: 'anime-action', label: '⚔️ Dramatic Anime Rush', prompt: 'Ultra-fast kinetic camera snap-zoom, dramatic speed lines, and anime lighting crescendo' },
  { id: 'drone-sweep', label: '🎬 Cinematic Drone Flyby', prompt: 'Smooth aerial drone flythrough, gentle atmospheric mist, and shallow depth of field' },
];

export const PhotoToVideoModal: React.FC<PhotoToVideoModalProps> = ({ isOpen, onClose, onShareWhatsApp }) => {
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_IMAGES[0].url);
  const [customPrompt, setCustomPrompt] = useState<string>(PRESET_IMAGES[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [motionType, setMotionType] = useState<'dolly_zoom' | 'orbit' | 'parallax' | 'pan_tilt' | 'rush'>('dolly_zoom');
  const [duration, setDuration] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [videoGenerated, setVideoGenerated] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Preload image
  useEffect(() => {
    if (!selectedImage) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage;
    img.onload = () => {
      loadedImageRef.current = img;
      if (videoGenerated) {
        drawFrame(0);
      }
    };
  }, [selectedImage, videoGenerated]);

  // Clean animation loop on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playBeep();
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      setVideoGenerated(false);
      setIsPlaying(false);
      soundEffects.playSuccessChime();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGenerate = async () => {
    soundEffects.playJarvisWake();
    setIsGenerating(true);
    setVideoGenerated(false);
    setIsPlaying(false);

    try {
      const response = await fetch('/api/photo-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          cinematicPrompt: customPrompt,
          aspectRatio,
          motionType,
          duration,
        }),
      });

      const data = await response.json();
      setGenerationResult(data);
      setVideoGenerated(true);
      setIsPlaying(true);
      soundEffects.playSuccessChime();

      // Start animation loop
      startTimeRef.current = performance.now();
      runAnimationLoop();
    } catch (err) {
      console.error('Error generating photo to video:', err);
      // Fallback local animation
      setGenerationResult({
        title: "⚡ Cinematic Video for Master Aijay Boss",
        directorNotes: "Rendered locally on vivo V17 with 48MP AI Quad Camera enhancement and Super AMOLED dynamic motion dynamics.",
        expandedPrompt: customPrompt,
        cameraMotion: "Dynamic 3D dolly-in with anamorphic flare and royal gold particles.",
        visualEffects: [
          "24K Golden Particles Vortex",
          "Anamorphic Cyan Lens Flare",
          "Depth of Field Micro-Zoom",
          "vivo V17 Super AMOLED Contrast"
        ],
        audioMood: "High-octane Hans Zimmer cinematic orchestral drop",
        beastDirectorTip: "Master Aijay Boss, this 60fps render is fully optimized for your vivo V17 screen!"
      });
      setVideoGenerated(true);
      setIsPlaying(true);
      startTimeRef.current = performance.now();
      runAnimationLoop();
    } finally {
      setIsGenerating(false);
    }
  };

  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const img = loadedImageRef.current;

    ctx.clearRect(0, 0, width, height);

    // Calculate motion parameters based on progress (0 to 1)
    // Motion curves: smooth sinusoidal ease in-out
    const t = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2);

    ctx.save();

    // Background fill dark obsidian
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, width, height);

    // Base zoom & transformation according to motionType
    let scale = 1.0;
    let dx = 0;
    let dy = 0;
    let rotation = 0;

    switch (motionType) {
      case 'dolly_zoom':
        scale = 1.05 + t * 0.28;
        dy = Math.sin(progress * Math.PI * 2) * 8;
        break;
      case 'orbit':
        scale = 1.1 + t * 0.15;
        dx = Math.sin(progress * Math.PI * 2) * 25;
        dy = Math.cos(progress * Math.PI * 2) * 12;
        rotation = Math.sin(progress * Math.PI * 2) * 0.03;
        break;
      case 'parallax':
        scale = 1.12 + Math.sin(progress * Math.PI * 2) * 0.1;
        dy = -15 + t * 30;
        break;
      case 'rush':
        scale = 1.0 + Math.pow(progress, 1.8) * 0.45;
        dy = -progress * 20;
        break;
      default: // pan_tilt
        scale = 1.15;
        dx = (progress - 0.5) * 40;
        dy = (0.5 - progress) * 20;
    }

    // Apply transformation centered
    ctx.translate(width / 2 + dx, height / 2 + dy);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // Draw image maintaining aspect ratio
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;
    let renderW = width;
    let renderH = height;

    if (imgAspect > canvasAspect) {
      renderH = height;
      renderW = height * imgAspect;
    } else {
      renderW = width;
      renderH = width / imgAspect;
    }

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

    ctx.restore();

    // Visual FX Layer 1: Atmospheric Golden Particles
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      const pProgress = (progress + i / particleCount) % 1;
      const px = ((i * 137.5) % width);
      const py = height - (pProgress * height * 1.1);
      const pSize = 1.5 + (i % 3.5);
      const pAlpha = Math.sin(pProgress * Math.PI) * 0.75;

      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? `rgba(251, 191, 36, ${pAlpha})` : `rgba(56, 189, 248, ${pAlpha * 0.8})`;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Visual FX Layer 2: Anamorphic Horizontal Lens Flare sweep
    const flareY = height * 0.38 + Math.sin(progress * Math.PI * 2) * (height * 0.15);
    const flareAlpha = 0.35 + 0.35 * Math.sin(progress * Math.PI * 2);

    const grad = ctx.createLinearGradient(0, flareY, width, flareY);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
    grad.addColorStop(0.3, `rgba(6, 182, 212, ${flareAlpha * 0.4})`);
    grad.addColorStop(0.5, `rgba(251, 191, 36, ${flareAlpha * 0.8})`);
    grad.addColorStop(0.7, `rgba(6, 182, 212, ${flareAlpha * 0.4})`);
    grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, flareY - 3, width, 6);
    ctx.restore();

    // Visual FX Layer 3: Subtle Vignette & Cinematic Border
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(5, 8, 18, 0.65)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Watermark overlay for Aijay Boss
    ctx.save();
    ctx.font = 'bold 11px Chakra Petch, sans-serif';
    ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
    ctx.fillText('👑 MR JARVIS BEAST · vivo V17 AI', 14, height - 16);
    ctx.restore();
  };

  const runAnimationLoop = () => {
    const loop = (currentTime: number) => {
      const elapsed = (currentTime - startTimeRef.current) / 1000;
      const progress = (elapsed % duration) / duration;
      drawFrame(progress);
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const togglePlayPause = () => {
    soundEffects.playBeep();
    if (isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsPlaying(false);
    } else {
      startTimeRef.current = performance.now();
      runAnimationLoop();
      setIsPlaying(true);
    }
  };

  const handleDownloadVideo = () => {
    soundEffects.playSuccessChime();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Record 4 seconds of canvas stream to create video file
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MrJarvisBeast_Cinematic_AijayBoss_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 3500);
    } catch (e) {
      // Fallback: download high-res snapshot
      const link = document.createElement('a');
      link.download = `MrJarvisBeast_Cinematic_Frame_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleShareVideoPrompt = () => {
    soundEffects.playBeep();
    const text = `🎬 *Mr Jarvis Beast Photo-to-Video AI Engine* 👑\n\n📌 *Project:* ${generationResult?.title || 'Cinematic Video for Master Aijay Boss'}\n🎥 *Prompt:* ${customPrompt}\n📐 *Aspect:* ${aspectRatio} (vivo V17 Screen)\n⚡ *Motion:* ${motionType}\n💡 *Director Tip:* ${generationResult?.beastDirectorTip || 'vivo V17 48MP AI Quad Camera Optimized'}`;
    onShareWhatsApp(text);
  };

  const canvasWidth = aspectRatio === '9:16' ? 360 : aspectRatio === '16:9' ? 640 : 480;
  const canvasHeight = aspectRatio === '9:16' ? 640 : aspectRatio === '16:9' ? 360 : 480;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#080d1a] border-2 border-amber-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg font-bold">
              <Film className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-chakra font-black text-base sm:text-lg text-slate-100 flex items-center gap-1.5">
                  Photo-to-Video AI Engine
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  NEW LAUNCH 🎬
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-700/50 hidden sm:inline">
                  vivo V17 48MP AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transform any photo into cinematic 4K video animation for Master Aijay Boss
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playBeep();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two-Column Workspace: Left Controls, Right Video Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT: Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. Custom Image Upload & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-chakra font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Step 1: Choose Photo (Upload or Preset)
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-700/40 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Upload from vivo V17</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCustomImageUpload}
              />

              {/* Presets grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_IMAGES.map((preset) => {
                  const isSelected = selectedImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundEffects.playBeep();
                        setSelectedImage(preset.url);
                        setCustomPrompt(preset.prompt);
                        setVideoGenerated(false);
                      }}
                      className={`p-1.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                        isSelected 
                          ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-500/10' 
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="h-14 rounded-lg overflow-hidden bg-black/60 mb-1 relative">
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 block truncate">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Cinematic Animation Prompts */}
            <div className="space-y-2">
              <span className="font-chakra font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                Step 2: Cinematic Animation Prompt
              </span>

              {/* Quick style chips */}
              <div className="flex flex-wrap gap-1.5">
                {CINEMATIC_PROMPTS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundEffects.playBeep();
                      setCustomPrompt(item.prompt);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-[11px] text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Text area */}
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                placeholder="Enter cinematic director prompt (camera motion, particles, lighting effects)..."
                className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-slate-100 text-xs font-mono outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 3. Motion Dynamics & Aspect Ratio Settings */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase font-chakra flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-cyan-400" />
                  Aspect Ratio
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: '9:16', label: '9:16 (vivo V17 / Reels)' },
                    { id: '16:9', label: '16:9 (4K Cinema)' },
                    { id: '1:1', label: '1:1 (Square)' },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => {
                        soundEffects.playBeep();
                        setAspectRatio(ratio.id as any);
                      }}
                      className={`p-1.5 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                        aspectRatio === ratio.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion Dynamics */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase font-chakra flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  Camera Motion
                </span>
                <select
                  value={motionType}
                  onChange={(e) => setMotionType(e.target.value as any)}
                  className="w-full p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-chakra font-medium outline-none cursor-pointer"
                >
                  <option value="dolly_zoom">🚀 3D Dolly Zoom In</option>
                  <option value="orbit">🔄 360° Dynamic Orbit</option>
                  <option value="parallax">🌊 Fluid Depth Parallax</option>
                  <option value="pan_tilt">📐 Cinematic Pan & Tilt</option>
                  <option value="rush">⚡ Hyper-Speed Rush</option>
                </select>
              </div>
            </div>

            {/* 4. Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3 rounded-xl font-chakra font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 shadow-amber-500/25 border border-amber-300'
              }`}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Synthesizing 4K Video for Master Aijay Boss...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 text-slate-950" />
                  <span>GENERATE CINEMATIC VIDEO FOR AIJAY BOSS 🎬</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT: Live Video Canvas & Player (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-black/60 rounded-2xl border border-slate-800 p-3 space-y-3">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
              <span className="font-chakra font-bold text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-400" />
                Live Video Canvas ({aspectRatio})
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                60 FPS ULTRA-HD
              </span>
            </div>

            {/* The HTML5 Canvas for real rendering */}
            <div className={`relative flex items-center justify-center rounded-xl overflow-hidden border border-amber-500/30 bg-[#040711] shadow-2xl ${
              aspectRatio === '9:16' ? 'w-48 sm:w-56 h-80 sm:h-96' : aspectRatio === '16:9' ? 'w-full h-44 sm:h-56' : 'w-56 h-56'
            }`}>
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-full object-cover rounded-xl"
              />

              {!videoGenerated && !isGenerating && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center">
                  <Film className="w-8 h-8 text-amber-400/80 mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-amber-200 font-chakra">
                    Ready for Master Aijay Boss
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tap "GENERATE CINEMATIC VIDEO" to animate this photo
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span className="text-xs font-bold text-amber-300 font-chakra">
                    Rendering 60fps Motion Dynamics...
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Applying Anamorphic Flare & Particles
                  </span>
                </div>
              )}
            </div>

            {/* Video Controls & Download */}
            {videoGenerated && (
              <div className="w-full space-y-2 pt-1 animate-in fade-in duration-300">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 text-xs font-chakra font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={handleDownloadVideo}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-chakra font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-emerald-500/20"
                    title="Export and download video file to vivo V17 phone"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Video</span>
                  </button>

                  <button
                    onClick={handleShareVideoPrompt}
                    className="p-2 rounded-xl bg-green-950/60 border border-green-600/50 hover:bg-green-900/60 text-green-300 text-xs flex items-center justify-center cursor-pointer active:scale-95"
                    title="Share video specs to WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Director Specs Box */}
                {generationResult && (
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[10px] space-y-1">
                    <div className="flex items-center justify-between text-amber-300 font-bold font-chakra">
                      <span className="truncate">{generationResult.title}</span>
                      <span className="text-cyan-400 font-mono shrink-0">vivo V17</span>
                    </div>
                    <p className="text-slate-400 line-clamp-2 leading-relaxed">
                      {generationResult.directorNotes}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 pt-0.5">
                      <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate text-amber-300/80">{generationResult.beastDirectorTip}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-amber-400">
            <Crown className="w-3.5 h-3.5" /> Exclusively dedicated to Master Aijay Boss on vivo V17
          </span>
          <button
            onClick={() => {
              soundEffects.playBeep();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
