/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { 
  Camera, 
  Zap, 
  Sun, 
  Focus, 
  Copy, 
  RefreshCw, 
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
  Check,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CAMERA_BODIES, LENSES, LIGHTING_STYLES, LIGHTING_TYPES, QUALITY_OPTIONS, ASPECT_RATIOS, SHOT_SIZES } from './constants';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export default function App() {
  const [subject, setSubject] = useState('');
  const [selectedBody, setSelectedBody] = useState(CAMERA_BODIES[0].id);
  const [selectedLens, setSelectedLens] = useState(LENSES[0].id);
  const [selectedStyle, setSelectedStyle] = useState(LIGHTING_STYLES[0].id);
  const [selectedType, setSelectedType] = useState(LIGHTING_TYPES[0].id);
  const [selectedShotSize, setSelectedShotSize] = useState(SHOT_SIZES[2].id);
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_OPTIONS[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [exposure, setExposure] = useState(0);
  
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);

  const constructPrompt = useCallback(() => {
    const bodyObj = CAMERA_BODIES.find(b => b.id === selectedBody);
    const lensObj = LENSES.find(l => l.id === selectedLens);
    const styleObj = LIGHTING_STYLES.find(s => s.id === selectedStyle);
    const typeObj = LIGHTING_TYPES.find(t => t.id === selectedType);
    const shotSizeObj = SHOT_SIZES.find(s => s.id === selectedShotSize);

    const baseSubject = subject.trim() || 'A professional photographic scene';
    const exposureText = exposure === 0 ? '' : ` Exposure compensation set to ${exposure > 0 ? '+' : ''}${exposure} EV for ${exposure > 0 ? 'bright, airy highlights and high-key aesthetics' : 'deep, moody shadows and rich blacks'}.`;
    
    const gearSection = `Captured with the ${bodyObj?.name} (${bodyObj?.description}) paired with a ${lensObj?.name} lens, utilizing its ${lensObj?.description.toLowerCase()} to achieve superior micro-contrast and edge-to-edge sharpness.`;
    const lightingSection = `The scene is masterfully illuminated with a ${styleObj?.name} style, creating ${styleObj?.description.toLowerCase()}, and further refined by ${typeObj?.name} which adds ${typeObj?.description.toLowerCase()} and professional-grade light falloff.`;
    const compositionSection = `The shot is framed as a ${shotSizeObj?.name}, which ${shotSizeObj?.description.toLowerCase()}.`;
    
    return `Professional photography: ${baseSubject}. ${compositionSection} ${gearSection} ${lightingSection}${exposureText} Technical specifications: 8k resolution, photorealistic textures, professional color science, tack-sharp focus, cinematic composition, high dynamic range (HDR), subtle film grain, natural skin tones, and sophisticated post-processing.`;
  }, [subject, selectedBody, selectedLens, selectedStyle, selectedType, selectedShotSize, exposure]);

  const handleGeneratePrompt = async () => {
    const basePrompt = constructPrompt();
    
    if (!isThinkingMode) {
      setGeneratedPrompt(basePrompt);
      return;
    }

    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are a world-class photography prompt engineer. Take the following base prompt and "juice it up" with extreme detail, professional photography terminology (composition, color theory, lighting physics, gear specifics), and atmospheric depth. Make it highly descriptive and actionable for an AI image generator.

Base Prompt: ${basePrompt}

Output ONLY the final refined prompt. Do not include any preamble or explanation.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });
      
      setGeneratedPrompt(response.text || basePrompt);
    } catch (error) {
      console.error("Error generating prompt with AI:", error);
      setGeneratedPrompt(basePrompt);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F4] text-[#1C1917] font-sans overflow-hidden">
      {/* Header - Compact */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
            <Camera className="text-white w-4 h-4" />
          </div>
          <h1 className="font-bold text-base tracking-tight">LensCraft</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
            v1.2.0 // HORIZONTAL ENGINE
          </div>
        </div>
      </header>

      {/* Main Content - Designed to fit without scrolling */}
      <main className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
        
        {/* Top Section: Subject & Exposure */}
        <div className="flex gap-4 shrink-0">
          <div className="flex-1">
            <textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Describe your scene..."
              className="w-full h-16 p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm text-sm"
            />
          </div>
          <div className="w-64 bg-white border border-stone-200 rounded-xl p-3 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Exposure</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600">{exposure > 0 ? '+' : ''}{exposure} EV</span>
            </div>
            <input 
              type="range" min="-2" max="2" step="0.5" value={exposure} 
              onChange={(e) => setExposure(parseFloat(e.target.value))}
              className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Middle Section: Vertical Columns */}
        <div className="flex-1 overflow-hidden flex gap-6 p-2">
          <SelectionColumn 
            label="Body" 
            options={CAMERA_BODIES}
            value={selectedBody}
            onChange={setSelectedBody}
          />
          <SelectionColumn 
            label="Lens" 
            options={LENSES}
            value={selectedLens}
            onChange={setSelectedLens}
          />
          <SelectionColumn 
            label="Style" 
            options={LIGHTING_STYLES}
            value={selectedStyle}
            onChange={setSelectedStyle}
          />
          <SelectionColumn 
            label="Type" 
            options={LIGHTING_TYPES}
            value={selectedType}
            onChange={setSelectedType}
          />
          <SelectionColumn 
            label="Shot Size" 
            options={SHOT_SIZES}
            value={selectedShotSize}
            onChange={setSelectedShotSize}
          />
          <SelectionColumn 
            label="Aspect" 
            options={ASPECT_RATIOS}
            value={selectedAspectRatio}
            onChange={setSelectedAspectRatio}
          />
          <SelectionColumn 
            label="Quality" 
            options={QUALITY_OPTIONS}
            value={selectedQuality}
            onChange={setSelectedQuality}
          />
        </div>

        {/* Bottom Section: Prompt Output */}
        <div className="h-1/3 min-h-[180px] shrink-0">
          <div className="h-full bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Architected Prompt</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsThinkingMode(!isThinkingMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                    isThinkingMode 
                      ? 'bg-violet-50 border-violet-200 text-violet-700 shadow-sm' 
                      : 'bg-white border-stone-100 text-stone-400 hover:bg-stone-50'
                  }`}
                  title="Enable AI-enhanced deep thinking for prompts"
                >
                  <Zap className={`w-4 h-4 ${isThinkingMode ? 'fill-violet-500 text-violet-500' : ''}`} />
                  <span className="text-xs font-bold uppercase tracking-tight">Thinking Mode</span>
                </button>
                <button 
                  onClick={handleCopy} 
                  className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 rounded-xl transition-colors text-stone-500 border border-stone-100"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span className="text-xs font-bold uppercase tracking-tight">{copied ? 'Copied' : 'Copy Prompt'}</span>
                </button>
                <button 
                  onClick={handleGeneratePrompt} 
                  disabled={isThinking}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span className="text-xs font-bold uppercase tracking-tight">
                    {isThinking ? 'Thinking...' : 'Re-Architect'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 selection-group-scroll bg-stone-50/50 rounded-xl p-4 border border-stone-100">
              <p className="text-lg font-medium leading-relaxed text-stone-800 italic">
                {generatedPrompt || "Select options above and click Re-Architect to build your professional photography prompt..."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SelectionColumn({ label, options, value, onChange }: { 
  label: string, 
  options: any[], 
  value: string, 
  onChange: (val: string) => void 
}) {
  return (
    <div className="flex flex-col h-full min-w-[140px] max-w-[200px]">
      <div className="px-1 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 selection-group-scroll">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            title={opt.description}
            className={`w-full text-left px-3 py-2 rounded-lg border text-[11px] font-semibold transition-all ${
              value === opt.id 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}
