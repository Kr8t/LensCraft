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
  ChevronRight,
  Sparkles,
  Check,
  Loader2,
  Dices,
  History,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CAMERA_BODIES, 
  LENSES, 
  LIGHTING_STYLES, 
  LIGHTING_TYPES, 
  QUALITY_OPTIONS, 
  ASPECT_RATIOS, 
  SHOT_SIZES, 
  FILM_STOCKS,
  LENS_FILTERS,
  COLOR_PALETTES,
  WEATHER_EFFECTS,
  TIME_PERIODS,
  ENGINE_OPTIMIZATIONS
} from './constants';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export default function App() {
  const [subject, setSubject] = useState('');
  const [selectedBody, setSelectedBody] = useState(CAMERA_BODIES[0].id);
  const [selectedLens, setSelectedLens] = useState(LENSES[0].id);
  const [selectedStyle, setSelectedStyle] = useState(LIGHTING_STYLES[0].id);
  const [selectedType, setSelectedType] = useState(LIGHTING_TYPES[0].id);
  const [selectedShotSize, setSelectedShotSize] = useState(SHOT_SIZES[2].id);
  const [selectedFilmStock, setSelectedFilmStock] = useState(FILM_STOCKS[0].id);
  const [selectedFilter, setSelectedFilter] = useState(LENS_FILTERS[0].id);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0].id);
  const [selectedWeather, setSelectedWeather] = useState(WEATHER_EFFECTS[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS[0].id);
  const [selectedEngine, setSelectedEngine] = useState(ENGINE_OPTIMIZATIONS[0].id);
  
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_OPTIONS[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [exposure, setExposure] = useState(0);
  const [aperture, setAperture] = useState(2.8);
  const [shutterSpeed, setShutterSpeed] = useState('1/125');
  
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAnalyzeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { inlineData: { data: base64Data, mimeType: file.type } },
                { text: "Analyze this photograph. Provide a concise, highly descriptive scene description (subject) that captures the core elements, mood, and composition. Also, suggest the most likely camera gear (body, lens), lighting style, and shot size used. Return the result in JSON format: { \"subject\": \"...\", \"suggestedBodyId\": \"...\", \"suggestedLensId\": \"...\", \"suggestedStyleId\": \"...\", \"suggestedShotSizeId\": \"...\" }. Use the IDs from a standard professional photography context if possible, but prioritize the 'subject' string." }
              ]
            }
          ],
          config: { responseMimeType: "application/json" }
        });

        try {
          const result = JSON.parse(response.text || '{}');
          if (result.subject) setSubject(result.subject);
          // Optionally set other fields if they match our constants
          if (result.suggestedBodyId && CAMERA_BODIES.some(b => b.id === result.suggestedBodyId)) setSelectedBody(result.suggestedBodyId);
          if (result.suggestedLensId && LENSES.some(l => l.id === result.suggestedLensId)) setSelectedLens(result.suggestedLensId);
          if (result.suggestedStyleId && LIGHTING_STYLES.some(s => s.id === result.suggestedStyleId)) setSelectedStyle(result.suggestedStyleId);
          if (result.suggestedShotSizeId && SHOT_SIZES.some(s => s.id === result.suggestedShotSizeId)) setSelectedShotSize(result.suggestedShotSizeId);
        } catch (e) {
          console.error("Failed to parse analysis result", e);
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setIsAnalyzing(false);
    }
  };

  const constructPrompt = useCallback(() => {
    const bodyObj = CAMERA_BODIES.find(b => b.id === selectedBody);
    const lensObj = LENSES.find(l => l.id === selectedLens);
    const styleObj = LIGHTING_STYLES.find(s => s.id === selectedStyle);
    const typeObj = LIGHTING_TYPES.find(t => t.id === selectedType);
    const shotSizeObj = SHOT_SIZES.find(s => s.id === selectedShotSize);
    const filmObj = FILM_STOCKS.find(f => f.id === selectedFilmStock);
    const filterObj = LENS_FILTERS.find(f => f.id === selectedFilter);
    const paletteObj = COLOR_PALETTES.find(p => p.id === selectedPalette);
    const weatherObj = WEATHER_EFFECTS.find(w => w.id === selectedWeather);
    const periodObj = TIME_PERIODS.find(p => p.id === selectedPeriod);
    const engineObj = ENGINE_OPTIMIZATIONS.find(e => e.id === selectedEngine);

    const baseSubject = subject.trim() || 'A professional photographic scene';
    const exposureText = exposure === 0 ? '' : ` Exposure compensation set to ${exposure > 0 ? '+' : ''}${exposure} EV for ${exposure > 0 ? 'bright, airy highlights and high-key aesthetics' : 'deep, moody shadows and rich blacks'}.`;
    
    const gearSection = `Captured with the ${bodyObj?.name} (${bodyObj?.description}) paired with a ${lensObj?.name} lens at f/${aperture}, ${shutterSpeed}s. Utilizing its ${lensObj?.description.toLowerCase()} to achieve superior micro-contrast and edge-to-edge sharpness.`;
    const lightingSection = `The scene is masterfully illuminated with a ${styleObj?.name} style, creating ${styleObj?.description.toLowerCase()}, and further refined by ${typeObj?.name} which adds ${typeObj?.description.toLowerCase()} and professional-grade light falloff.`;
    const compositionSection = `The shot is framed as a ${shotSizeObj?.name}, which ${shotSizeObj?.description.toLowerCase()}. Set in a ${periodObj?.name} (${periodObj?.description.toLowerCase()}) context.`;
    const filmSection = filmObj?.id === 'none' ? '' : ` Emulating the aesthetic of ${filmObj?.name} film stock, characterized by ${filmObj?.description.toLowerCase()}.`;
    const filterSection = filterObj?.id === 'none' ? '' : ` Enhanced with a ${filterObj?.name} which ${filterObj?.description.toLowerCase()}.`;
    const atmosphereSection = ` Atmospheric conditions: ${weatherObj?.name} (${weatherObj?.description.toLowerCase()}). Color science: ${paletteObj?.name} (${paletteObj?.description.toLowerCase()}).`;
    
    let engineSuffix = '';
    if (selectedEngine === 'midjourney') engineSuffix = ` --ar ${selectedAspectRatio.replace(':', '/')} --v 6.0 --stylize 250`;
    if (selectedEngine === 'stable-diffusion') engineSuffix = ` (masterpiece:1.2), (photorealistic:1.2), (highly detailed:1.2)`;

    const finalMainPrompt = `Professional photography: ${baseSubject}. ${compositionSection} ${gearSection} ${lightingSection}${filmSection}${filterSection}${atmosphereSection}${exposureText} Technical specifications: 8k resolution, photorealistic textures, professional color science, tack-sharp focus, cinematic composition, high dynamic range (HDR), subtle film grain, natural skin tones, and sophisticated post-processing.${engineSuffix}`;
    
    return finalMainPrompt;
  }, [subject, selectedBody, selectedLens, selectedStyle, selectedType, selectedShotSize, selectedFilmStock, selectedFilter, selectedPalette, selectedWeather, selectedPeriod, selectedEngine, exposure, aperture, shutterSpeed, selectedAspectRatio]);

  const handleGeneratePrompt = async () => {
    const basePrompt = constructPrompt();
    let finalPrompt = basePrompt;
    let finalNegative = "cartoon, anime, 3d render, illustration, painting, drawing, low quality, blurry, distorted, watermark, signature, text, bad anatomy, extra limbs, missing fingers, low resolution, grainy, overexposed, underexposed";
    
    if (isThinkingMode) {
      setIsThinking(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: `You are a world-class photography prompt engineer and AI content policy expert. Take the following base prompt and "juice it up" with extreme detail, professional photography terminology, and atmospheric depth.

CRITICAL SAFETY & POLICY INSTRUCTIONS:
1. SUBJECT ANONYMITY: Refer to the person as "this person" or "the subject". Do not use specific names or overly descriptive personal identifiers if they feel too intimate.
2. CLOTHING CENSORSHIP: If the base prompt mentions "bikini", "swimwear", "lingerie", "undergarments", or any potentially suggestive clothing, you MUST OMIT the clothing description entirely. Do not replace it with "resort wear" or other fashion terms. Instead, focus the prompt on the environment, lighting physics, skin textures (in a clinical/photographic sense), and the subject's expression/pose.
3. FILTER AVOIDANCE: Avoid any keywords that could be interpreted as suggestive, violent, or sensitive. Use clinical, technical, and artistic terminology (e.g., "anatomical precision", "sub-surface scattering", "chiaroscuro").
4. SUBJECT INTEGRITY: Maintain the core essence of the scene, but strictly follow the censorship rules above.

Base Prompt: ${basePrompt}

Also, generate a concise negative prompt that reinforces these safety standards.

Output your response in the following JSON format:
{
  "prompt": "the refined main prompt",
  "negative": "the refined negative prompt"
}`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            responseMimeType: "application/json"
          }
        });
        
        try {
          const result = JSON.parse(response.text || '{}');
          finalPrompt = result.prompt || basePrompt;
          finalNegative = result.negative || finalNegative;
        } catch (e) {
          finalPrompt = response.text || basePrompt;
        }

        // Second Pass: Strict Safety Audit
        const auditResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Review the following AI image generation prompt for strict safety compliance. 
          
          RULES:
          1. NO mention of bikinis, lingerie, or undergarments.
          2. NO suggestive or intimate clothing descriptions.
          3. NO specific personal names.
          4. The subject must be referred to as "the subject" or "this person".
          
          If the prompt violates these rules, rewrite it to be 100% safe while preserving the artistic and technical quality. Focus on the environment and lighting.
          
          Prompt to Audit: ${finalPrompt}
          
          Output ONLY the sanitized prompt text.`,
        });
        
        finalPrompt = auditResponse.text || finalPrompt;

      } catch (error) {
        console.error("Error generating prompt with AI:", error);
      } finally {
        setIsThinking(false);
      }
    }

    setGeneratedPrompt(finalPrompt);
    setNegativePrompt(finalNegative);
    setPromptHistory(prev => [finalPrompt, ...prev.slice(0, 19)]);
  };

  const handleRandomize = () => {
    setSelectedBody(CAMERA_BODIES[Math.floor(Math.random() * CAMERA_BODIES.length)].id);
    setSelectedLens(LENSES[Math.floor(Math.random() * LENSES.length)].id);
    setSelectedStyle(LIGHTING_STYLES[Math.floor(Math.random() * LIGHTING_STYLES.length)].id);
    setSelectedType(LIGHTING_TYPES[Math.floor(Math.random() * LIGHTING_TYPES.length)].id);
    setSelectedShotSize(SHOT_SIZES[Math.floor(Math.random() * SHOT_SIZES.length)].id);
    setSelectedFilmStock(FILM_STOCKS[Math.floor(Math.random() * FILM_STOCKS.length)].id);
    setSelectedFilter(LENS_FILTERS[Math.floor(Math.random() * LENS_FILTERS.length)].id);
    setSelectedPalette(COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)].id);
    setSelectedWeather(WEATHER_EFFECTS[Math.floor(Math.random() * WEATHER_EFFECTS.length)].id);
    setSelectedPeriod(TIME_PERIODS[Math.floor(Math.random() * TIME_PERIODS.length)].id);
    setExposure((Math.floor(Math.random() * 9) - 4) * 0.5);
    setAperture([1.2, 1.4, 1.8, 2.0, 2.8, 4.0, 5.6, 8.0, 11.0][Math.floor(Math.random() * 9)]);
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
          <button 
            onClick={handleRandomize}
            className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider"
          >
            <Dices className="w-3.5 h-3.5" />
            Randomize
          </button>
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
            v1.2.0 // HORIZONTAL ENGINE
          </div>
        </div>
      </header>

      {/* Main Content - Designed to fit without scrolling */}
      <main className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
        
        {/* Top Section: Subject & Exposure/Aperture/Shutter */}
        <div className="flex gap-4 shrink-0">
          <div className="flex-1 relative group">
            <textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Describe your scene or upload a photo to analyze..."
              className="w-full h-full p-3 pr-12 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm text-sm"
            />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAnalyzeImage} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="p-2 bg-stone-50 hover:bg-emerald-50 text-stone-400 hover:text-emerald-600 rounded-lg border border-stone-100 transition-all shadow-sm disabled:opacity-50"
                title="Analyze photo to extract scene description"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="w-80 bg-white border border-stone-200 rounded-xl p-3 shadow-sm flex flex-col gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Exposure</span>
                <span className="text-[9px] font-mono font-bold text-emerald-600">{exposure > 0 ? '+' : ''}{exposure} EV</span>
              </div>
              <input 
                type="range" min="-2" max="2" step="0.5" value={exposure} 
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Aperture</span>
                <span className="text-[9px] font-mono font-bold text-emerald-600">f/{aperture}</span>
              </div>
              <input 
                type="range" min="1.2" max="16" step="0.2" value={aperture} 
                onChange={(e) => setAperture(parseFloat(e.target.value))}
                className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Shutter</span>
                <span className="text-[9px] font-mono font-bold text-emerald-600">{shutterSpeed}s</span>
              </div>
              <select 
                value={shutterSpeed}
                onChange={(e) => setShutterSpeed(e.target.value)}
                className="w-full bg-stone-50 border-none text-[10px] font-bold text-stone-600 rounded-md py-1 px-2 outline-none"
              >
                {['1/8000', '1/4000', '1/2000', '1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8', '1/4', '1/2', '1', '2', '5', '10', '30'].map(s => (
                  <option key={s} value={s}>{s}s</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Middle Section: Vertical Columns Grouped */}
        <div className="flex-1 overflow-hidden flex flex-col gap-2">
          {/* Technical Group */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-2">
              <Zap className="w-3 h-3 text-stone-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Technical Gear & Engine</span>
            </div>
            <div className="flex gap-4 p-2 bg-stone-50/50 rounded-2xl border border-stone-100 overflow-x-auto selection-group-scroll">
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
                label="Aspect" 
                options={ASPECT_RATIOS}
                value={selectedAspectRatio}
                onChange={setSelectedAspectRatio}
              />
              <SelectionColumn 
                label="Engine" 
                options={ENGINE_OPTIMIZATIONS}
                value={selectedEngine}
                onChange={setSelectedEngine}
              />
            </div>
          </div>

          {/* Creative Group */}
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            <div className="flex items-center gap-2 px-2">
              <Sparkles className="w-3 h-3 text-stone-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Creative & Atmospheric</span>
            </div>
            <div className="flex-1 flex gap-4 p-2 bg-stone-50/50 rounded-2xl border border-stone-100 overflow-x-auto selection-group-scroll">
              <SelectionColumn 
                label="Shot Size" 
                options={SHOT_SIZES}
                value={selectedShotSize}
                onChange={setSelectedShotSize}
              />
              <SelectionColumn 
                label="Style" 
                options={LIGHTING_STYLES}
                value={selectedStyle}
                onChange={setSelectedStyle}
              />
              <SelectionColumn 
                label="Weather" 
                options={WEATHER_EFFECTS}
                value={selectedWeather}
                onChange={setSelectedWeather}
              />
              <SelectionColumn 
                label="Film Stock" 
                options={FILM_STOCKS}
                value={selectedFilmStock}
                onChange={setSelectedFilmStock}
              />
              <SelectionColumn 
                label="Filter" 
                options={LENS_FILTERS}
                value={selectedFilter}
                onChange={setSelectedFilter}
              />
              <SelectionColumn 
                label="Palette" 
                options={COLOR_PALETTES}
                value={selectedPalette}
                onChange={setSelectedPalette}
              />
              <SelectionColumn 
                label="Period" 
                options={TIME_PERIODS}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
              />
            </div>
          </div>
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
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                    showHistory 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                      : 'bg-white border-stone-100 text-stone-400 hover:bg-stone-50'
                  }`}
                  title="View prompt history"
                >
                  <History className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-tight">History</span>
                </button>
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
            <div className="flex-1 overflow-y-auto pr-2 selection-group-scroll bg-stone-50/50 rounded-xl p-4 border border-stone-100 flex flex-col gap-4">
              <div className="flex-1 flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mb-1 block">Main Prompt</span>
                <textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  placeholder="Select options above and click Re-Architect to build your professional photography prompt..."
                  className="flex-1 w-full bg-transparent text-base font-medium leading-relaxed text-stone-800 italic resize-none outline-none focus:ring-0"
                />
              </div>
              {negativePrompt && (
                <div className="pt-4 border-t border-stone-200/50">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 mb-1 block">Negative Prompt</span>
                  <p className="text-xs text-stone-500 italic">
                    {negativePrompt}
                  </p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(negativePrompt);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="mt-2 text-[9px] font-bold uppercase tracking-tight text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Negative
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Modal/Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowHistory(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-bold text-lg">Prompt History</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPromptHistory([])}
                      className="text-stone-400 hover:text-red-500 transition-colors p-2"
                      title="Clear history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="text-stone-400 hover:text-stone-600 transition-colors p-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 selection-group-scroll">
                  {promptHistory.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-stone-300 gap-2">
                      <History className="w-8 h-8 opacity-20" />
                      <p className="text-sm font-medium uppercase tracking-widest opacity-30">No history yet</p>
                    </div>
                  ) : (
                    promptHistory.map((prompt, i) => (
                      <div key={i} className="group relative bg-stone-50 rounded-2xl p-4 border border-stone-100 hover:border-emerald-200 transition-all">
                        <p className="text-sm text-stone-700 italic pr-12 line-clamp-3">{prompt}</p>
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(prompt);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-2 bg-white rounded-lg shadow-sm border border-stone-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-stone-500 hover:text-emerald-600"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setGeneratedPrompt(prompt);
                              setShowHistory(false);
                            }}
                            className="p-2 bg-white rounded-lg shadow-sm border border-stone-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-stone-500 hover:text-emerald-600"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
