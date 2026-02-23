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
  const [promptMode, setPromptMode] = useState<'technical' | 'creative' | 'both'>('both');

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

    let finalMainPrompt = `Professional photography: ${baseSubject}.`;
    
    if (promptMode === 'both' || promptMode === 'creative') {
      finalMainPrompt += ` ${compositionSection} ${lightingSection}${filmSection}${atmosphereSection}`;
    }
    
    if (promptMode === 'both' || promptMode === 'technical') {
      finalMainPrompt += ` ${gearSection}${filterSection}${exposureText}`;
    }

    const techSpecs = ` Technical specifications: 8k resolution, photorealistic textures, professional color science, tack-sharp focus, cinematic composition, high dynamic range (HDR), subtle film grain, natural skin tones, and sophisticated post-processing.`;
    finalMainPrompt += `${techSpecs}${engineSuffix}`;
    
    return finalMainPrompt;
  }, [subject, selectedBody, selectedLens, selectedStyle, selectedType, selectedShotSize, selectedFilmStock, selectedFilter, selectedPalette, selectedWeather, selectedPeriod, selectedEngine, exposure, aperture, shutterSpeed, selectedAspectRatio, promptMode]);

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
    <div className="h-screen bg-bauhaus-cream flex flex-col font-sans overflow-hidden border-[12px] border-bauhaus-black">
      {/* Header */}
      <header className="h-16 border-b-4 border-bauhaus-black flex items-center justify-between px-6 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-bauhaus-red flex items-center justify-center border-2 border-bauhaus-black">
            <Camera className="text-white w-6 h-6" />
          </div>
          <h1 className="font-black text-2xl uppercase tracking-tighter">LensCraft</h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleRandomize}
            className="flex items-center gap-2 px-4 py-2 bg-bauhaus-yellow border-2 border-bauhaus-black hover:bg-bauhaus-black hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            <Dices className="w-4 h-4" />
            Randomize
          </button>
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
            v2.0.0 // BAUHAUS_EDITION
          </div>
        </div>
      </header>

      {/* Main Content - Side-by-Side Layout */}
      <main className="flex-1 overflow-hidden flex flex-row p-0 gap-0">
        
        {/* Left Panel: Options (Wider) */}
        <div className="w-[60%] border-r-4 border-bauhaus-black flex flex-col overflow-hidden bg-white">
          {/* Prompt Mode Toggle */}
          <div className="flex border-b-4 border-bauhaus-black shrink-0 bg-bauhaus-black p-1 gap-1">
            {(['technical', 'creative', 'both'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPromptMode(mode)}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 border-transparent ${
                  promptMode === mode 
                    ? 'bg-bauhaus-yellow text-bauhaus-black border-bauhaus-black' 
                    : 'bg-bauhaus-black text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto selection-group-scroll flex flex-col gap-0">
            {/* Technical Group */}
            <div className={`flex flex-col gap-0 border-b-4 border-bauhaus-black transition-all duration-500 ${promptMode === 'creative' ? 'opacity-20 grayscale pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
              <div className="flex items-center justify-between px-4 py-2 bg-bauhaus-blue border-b-2 border-bauhaus-black">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Technical Gear & Engine</span>
                </div>
                {promptMode === 'creative' && <span className="text-[9px] font-black text-white/50 uppercase">Disabled</span>}
              </div>
              <div className="flex gap-0 bg-white overflow-x-auto selection-group-scroll h-56 border-b-2 border-bauhaus-black">
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
              <div className="p-6 bg-bauhaus-yellow flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest">Exposure Compensation</span>
                      <span className="text-[10px] font-mono font-black bg-bauhaus-black text-white px-2 py-0.5">{exposure > 0 ? '+' : ''}{exposure} EV</span>
                    </div>
                    <input 
                      type="range" min="-2" max="2" step="0.5" value={exposure} 
                      onChange={(e) => setExposure(parseFloat(e.target.value))}
                      className="w-full h-2 bg-bauhaus-black rounded-none appearance-none cursor-pointer accent-bauhaus-red border border-bauhaus-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest">Aperture Setting</span>
                      <span className="text-[10px] font-mono font-black bg-bauhaus-black text-white px-2 py-0.5">f/{aperture}</span>
                    </div>
                    <input 
                      type="range" min="1.2" max="16" step="0.2" value={aperture} 
                      onChange={(e) => setAperture(parseFloat(e.target.value))}
                      className="w-full h-2 bg-bauhaus-black rounded-none appearance-none cursor-pointer accent-bauhaus-red border border-bauhaus-black"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6 bg-white border-4 border-bauhaus-black p-3">
                  <span className="text-[10px] font-black uppercase tracking-widest shrink-0">Shutter Speed</span>
                  <div className="flex-1 flex gap-1 overflow-x-auto selection-group-scroll py-1">
                    {['1/8000', '1/4000', '1/2000', '1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8', '1/4', '1/2', '1', '2', '5', '10', '30'].map(s => (
                      <button
                        key={s}
                        onClick={() => setShutterSpeed(s)}
                        className={`px-3 py-1 text-[10px] font-black border-2 transition-all shrink-0 ${
                          shutterSpeed === s 
                            ? 'bg-bauhaus-red text-white border-bauhaus-black' 
                            : 'bg-white text-bauhaus-black border-transparent hover:border-bauhaus-black'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Creative Group */}
            <div className={`flex-1 flex flex-col gap-0 overflow-hidden transition-all duration-500 ${promptMode === 'technical' ? 'opacity-20 grayscale pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
              <div className="flex items-center justify-between px-4 py-2 bg-bauhaus-red border-b-2 border-bauhaus-black">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Creative & Atmospheric</span>
                </div>
                {promptMode === 'technical' && <span className="text-[9px] font-black text-white/50 uppercase">Disabled</span>}
              </div>
              <div className="flex-1 flex gap-0 bg-white overflow-x-auto selection-group-scroll">
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
        </div>

        {/* Right Panel: Subject & Output (Narrower) */}
        <div className="w-[40%] flex flex-col overflow-hidden bg-bauhaus-cream">
          {/* Scene Description */}
          <div className="h-[45%] relative group border-b-4 border-bauhaus-black bg-white">
            <div className="absolute top-0 left-0 px-4 py-1 bg-bauhaus-black text-white text-[10px] font-black uppercase tracking-widest z-10">
              01 // Scene Subject
            </div>
            <textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="DESCRIBE YOUR VISION OR UPLOAD A REFERENCE..."
              className="w-full h-full p-10 pt-14 bg-transparent outline-none transition-all resize-none font-black text-2xl uppercase placeholder:text-stone-200 leading-tight"
            />
            <div className="absolute right-8 bottom-8 flex gap-4">
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
                className="w-16 h-16 bg-bauhaus-blue text-white flex items-center justify-center border-4 border-bauhaus-black hover:bg-bauhaus-yellow hover:text-bauhaus-black transition-all disabled:opacity-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                title="ANALYZE PHOTO"
              >
                {isAnalyzing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
              </button>
            </div>
          </div>

          {/* Prompt Output */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
            <div className="absolute top-0 left-0 px-4 py-1 bg-bauhaus-black text-white text-[10px] font-black uppercase tracking-widest z-10">
              02 // Architected Output
            </div>
            
            <div className="flex-1 overflow-y-auto selection-group-scroll p-6 pt-10 flex flex-col gap-4">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-black uppercase tracking-widest text-bauhaus-red">Main Prompt</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className={`p-2 border-2 border-bauhaus-black transition-all ${
                        showHistory 
                          ? 'bg-bauhaus-blue text-white' 
                          : 'bg-white text-bauhaus-black hover:bg-bauhaus-yellow'
                      }`}
                      title="History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsThinkingMode(!isThinkingMode)}
                      className={`p-2 border-2 border-bauhaus-black transition-all ${
                        isThinkingMode 
                          ? 'bg-bauhaus-red text-white' 
                          : 'bg-white text-bauhaus-black hover:bg-bauhaus-yellow'
                      }`}
                      title="Thinking Mode"
                    >
                      <Focus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  placeholder="SELECT OPTIONS AND CLICK RE-ARCHITECT..."
                  className="flex-1 w-full bg-transparent text-sm font-bold leading-relaxed text-bauhaus-black uppercase resize-none outline-none focus:ring-0 placeholder:text-stone-200"
                />
              </div>
              
              {negativePrompt && (
                <div className="pt-4 border-t-2 border-bauhaus-black">
                  <span className="text-[11px] font-black uppercase tracking-widest text-bauhaus-blue mb-2 block">Negative Prompt</span>
                  <p className="text-[10px] font-bold text-stone-400 uppercase leading-relaxed">
                    {negativePrompt}
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="border-t-4 border-bauhaus-black bg-bauhaus-cream p-6 flex gap-4">
              <button 
                onClick={handleGeneratePrompt}
                disabled={isThinking}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-bauhaus-black text-white border-4 border-bauhaus-black hover:bg-bauhaus-yellow hover:text-bauhaus-black transition-all disabled:opacity-50 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                {isThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                Re-Architect
              </button>
              <button 
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-bauhaus-yellow text-bauhaus-black border-4 border-bauhaus-black hover:bg-bauhaus-black hover:text-white transition-all font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                Copy Prompt
              </button>
            </div>
          </div>
        </div>
      </main>
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
                className="bg-bauhaus-cream w-full max-w-2xl max-h-[80vh] border-4 border-bauhaus-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b-4 border-bauhaus-black flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-bauhaus-blue" />
                    <h2 className="font-black text-xl uppercase tracking-tighter">Prompt History</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPromptHistory([])}
                      className="text-stone-400 hover:text-bauhaus-red transition-colors p-2"
                      title="Clear history"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="text-stone-400 hover:text-bauhaus-black transition-colors p-2"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 selection-group-scroll">
                  {promptHistory.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-stone-300 gap-4">
                      <History className="w-12 h-12 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-30">No history yet</p>
                    </div>
                  ) : (
                    promptHistory.map((prompt, i) => (
                      <div key={i} className="group relative bg-white p-6 border-2 border-bauhaus-black hover:bg-bauhaus-yellow transition-all">
                        <p className="text-sm font-bold text-bauhaus-black uppercase pr-12 line-clamp-3">{prompt}</p>
                        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(prompt);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-2 bg-white border-2 border-bauhaus-black hover:bg-bauhaus-red hover:text-white transition-all"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setGeneratedPrompt(prompt);
                              setShowHistory(false);
                            }}
                            className="p-2 bg-white border-2 border-bauhaus-black hover:bg-bauhaus-blue hover:text-white transition-all"
                          >
                            <RefreshCw className="w-4 h-4" />
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
    <div className="flex flex-col h-full min-w-[140px] max-w-[200px] border-r border-bauhaus-black last:border-r-0">
      <div className="px-3 py-2 bg-bauhaus-black">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">{label}</span>
      </div>
      <div className="flex-1 overflow-y-auto selection-group-scroll">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            title={opt.description}
            className={`w-full text-left px-3 py-3 border-b border-bauhaus-black text-[11px] font-bold uppercase tracking-tight transition-all ${
              value === opt.id 
                ? 'bg-bauhaus-red text-white' 
                : 'bg-white text-bauhaus-black hover:bg-bauhaus-yellow'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}
