export const CAMERA_BODIES = [
  { id: 'sony-a7r-v', name: 'Sony A7R V', description: 'High resolution, professional detail' },
  { id: 'canon-eos-r5', name: 'Canon EOS R5', description: 'Classic color science, versatile' },
  { id: 'nikon-z9', name: 'Nikon Z9', description: 'Robust, high-speed performance' },
  { id: 'fujifilm-gfx100', name: 'Fujifilm GFX100 II', description: 'Medium format depth and texture' },
  { id: 'leica-m11', name: 'Leica M11', description: 'Iconic rangefinder look, street photography' },
  { id: 'hasselblad-x2d', name: 'Hasselblad X2D 100C', description: 'Ultimate color accuracy, medium format' },
];

export const LENSES = [
  { id: '35mm-f14', name: '35mm f/1.4', description: 'Classic storytelling, wide but natural' },
  { id: '50mm-f12', name: '50mm f/1.2', description: 'The "Nifty Fifty", human-eye perspective' },
  { id: '85mm-f12', name: '85mm f/1.2', description: 'Ultimate portrait lens, creamy bokeh' },
  { id: '24-70mm-f28', name: '24-70mm f/2.8', description: 'The versatile workhorse zoom' },
  { id: '16-35mm-f28', name: '16-35mm f/2.8', description: 'Ultra-wide for landscapes and architecture' },
  { id: '100mm-macro', name: '100mm f/2.8 Macro', description: 'Extreme detail for close-ups' },
  { id: '70-200mm-f28', name: '70-200mm f/2.8', description: 'Compression and isolation for sports/wildlife' },
];

export const LIGHTING_STYLES = [
  { id: 'cinematic', name: 'Cinematic', description: 'High contrast, dramatic shadows' },
  { id: 'soft-glamour', name: 'Soft Glamour', description: 'Flattering, even light, minimal shadows' },
  { id: 'moody-noir', name: 'Moody Noir', description: 'Dark, atmospheric, heavy shadows' },
  { id: 'high-key', name: 'High Key', description: 'Bright, airy, optimistic' },
  { id: 'low-key', name: 'Low Key', description: 'Dark background, focused light' },
  { id: 'golden-hour', name: 'Golden Hour', description: 'Warm, directional, long shadows' },
  { id: 'blue-hour', name: 'Blue Hour', description: 'Cool, ethereal, twilight glow' },
];

export const LIGHTING_TYPES = [
  { id: 'rembrandt', name: 'Rembrandt Lighting', description: 'Classic triangle of light on the cheek' },
  { id: 'butterfly', name: 'Butterfly Lighting', description: 'Symmetrical shadow under the nose' },
  { id: 'rim-light', name: 'Rim Lighting', description: 'Backlit edges to separate subject from background' },
  { id: 'split-lighting', name: 'Split Lighting', description: 'Subject lit on exactly one side' },
  { id: 'volumetric', name: 'Volumetric Lighting', description: 'Visible light beams, "God rays"' },
  { id: 'neon-cyberpunk', name: 'Neon / Cyberpunk', description: 'Vibrant, multi-colored artificial light' },
  { id: 'natural-window', name: 'Natural Window Light', description: 'Soft, directional, organic' },
  { id: 'studio-strobes', name: 'Studio Strobes', description: 'Powerful, controlled artificial flashes for crisp detail' },
  { id: 'natural-diffused', name: 'Natural Diffused Light', description: 'Soft, even illumination from an overcast sky or large softbox' },
];

export const QUALITY_OPTIONS = [
  { id: '1K', name: 'Standard', description: 'Fast generation, 1024px' },
  { id: '2K', name: 'HD', description: 'High definition, 2048px' },
  { id: '4K', name: '4K Ultra', description: 'Maximum detail, 4096px' },
];

export const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1', description: 'Square (Social Media)' },
  { id: '4:3', name: '4:3', description: 'Classic Photography' },
  { id: '3:2', name: '3:2', description: '35mm Film Standard' },
  { id: '16:9', name: '16:9', description: 'Widescreen Cinematic' },
  { id: '9:16', name: '9:16', description: 'Portrait (Stories/Reels)' },
];

export const SHOT_SIZES = [
  { id: 'establishing-shot', name: 'Establishing Shot', description: 'A shot at the head of a scene that clearly shows the location the action is set in' },
  { id: 'extreme-wide', name: 'Extreme Wide Shot (EWS)', description: 'Makes the subject appear small against their location, emphasizing the vastness of the environment' },
  { id: 'wide-shot', name: 'Wide Shot (WS)', description: 'Balances both the subject and the surrounding imagery, keeping the entire subject in frame while giving context' },
  { id: 'full-shot', name: 'Full Shot (FS)', description: 'Lets the subject fill the frame from head to toe while still allowing some features of the scenery' },
  { id: 'medium-wide', name: 'Medium Wide Shot (MWS)', description: 'Frames the subject from roughly the knees up, splitting the difference between a full shot and a medium shot' },
  { id: 'cowboy-shot', name: 'Cowboy Shot (CS)', description: 'Frames the subject from mid-thighs up, used to include action and emotion while showing the subject from the waist down' },
  { id: 'medium-shot', name: 'Medium Shot (MS)', description: 'Frames the subject from the waist up, balancing composition between the subject and their surroundings' },
  { id: 'medium-closeup', name: 'Medium Close-Up (MCU)', description: 'Frames the subject from the chest up, perfect for capturing facial expressions and slight gestures' },
  { id: 'closeup', name: 'Close-Up (CU)', description: 'Fills the frame with a part of the subject, typically the face, to reveal emotions and reactions' },
  { id: 'extreme-closeup', name: 'Extreme Close-Up (ECU)', description: 'Fills the frame with tiny details like eyes or textures, capturing nuances that would otherwise be missed' },
  { id: 'low-angle', name: 'Low Angle', description: 'Looking up at subject, powerful and heroic' },
  { id: 'high-angle', name: 'High Angle', description: 'Looking down at subject, vulnerable or overview' },
  { id: 'birds-eye', name: 'Bird\'s Eye', description: 'Directly from above, map-like perspective' },
];
