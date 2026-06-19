import { PDFDocument, PDFName, PDFRawStream, PDFContentStream, PDFRef } from 'pdf-lib';
import pako from 'pako';

export const DEFAULT_COLOR_MAP = [
  // White backgrounds → dark
  { light: [255,255,255], dark: [20,20,24], name: 'white→bg', tolerance: 8 },
  { light: [246,246,246], dark: [26,26,32], name: 'Grey50→bg2', tolerance: 6 },
  { light: [242,242,242], dark: [30,30,38], name: 'codebg', tolerance: 6 },
  { light: [230,230,230], dark: [36,36,44], name: 'Grey100', tolerance: 6 },
  { light: [247,247,249], dark: [28,28,34], name: 'twhite', tolerance: 6 },
  { light: [255,249,229], dark: [30,28,20], name: 'tcreme', tolerance: 8 },
  { light: [255,228,150], dark: [60,55,20], name: 'tyellow', tolerance: 15 },
  { light: [255,255,0],   dark: [80,80,0],  name: 'pure_yellow', tolerance: 20 },

  // Text
  { light: [0,0,0], dark: [220,220,228], name: 'black→text', tolerance: 5 },
  
  // Stars 
  { light: [20,20,20], dark: [60,60,68], name: 'tstarblack', tolerance: 10 },
  { light: [185,185,185], dark: [170,170,175], name: 'tstargrey (absent)', tolerance: 6 },

  // Greyscale
  { light: [209,209,209], dark: [50,50,58], name: 'Grey200', tolerance: 6 },
  { light: [199,199,199], dark: [56,56,64], name: 'tgrey/C7', tolerance: 6 },
  { light: [200,200,200], dark: [55,55,65], name: 'tarrowgrey', tolerance: 6 },
  { light: [176,176,176], dark: [64,64,72], name: 'Grey300', tolerance: 6 },
  { light: [150,150,150], dark: [140,140,155], name: 'tdarkgrey', tolerance: 6 },
  { light: [136,136,136], dark: [110,110,125], name: 'Grey400', tolerance: 6 },
  { light: [109,109,109], dark: [130,130,145], name: 'Grey500', tolerance: 6 },
  { light: [93,93,93], dark: [150,150,165], name: 'Grey600', tolerance: 6 },
  { light: [79,79,79], dark: [160,160,175], name: 'Grey700', tolerance: 6 },
  { light: [69,69,69], dark: [170,170,185], name: 'Grey800', tolerance: 6 },
  { light: [61,61,61], dark: [180,180,195], name: 'Grey900', tolerance: 6 },
  { light: [221,221,221], dark: [45,45,55], name: 'tblack/DD', tolerance: 6 },

  // Expert Blue (Title page & Headers -> Dark Purple)
  { light: [119,90,255], dark: [45,35,95], name: 'ExpertBlue500', tolerance: 10 },
  { light: [48,68,255], dark: [60,80,150], name: 'accentcolor', tolerance: 10 },
  { light: [33,11,106], dark: [160,140,255], name: 'expblue950', tolerance: 8 },
  { light: [95,48,247], dark: [120,80,255], name: 'expblue600', tolerance: 8 },
  { light: [82,30,227], dark: [130,90,255], name: 'expblue700', tolerance: 8 },
  { light: [67,24,191], dark: [140,100,255], name: 'expblue800', tolerance: 8 },
  { light: [57,22,156], dark: [150,120,255], name: 'expblue900', tolerance: 8 },
  { light: [148,133,255], dark: [148,133,255], name: 'expblue400', tolerance: 8 },
  { light: [184,177,255], dark: [100,90,180], name: 'expblue300', tolerance: 8 },
  { light: [213,212,255], dark: [55,52,100], name: 'expblue200', tolerance: 8 },
  { light: [233,232,255], dark: [40,38,75], name: 'expblue100', tolerance: 8 },
  { light: [243,242,255], dark: [30,28,55], name: 'expblue50', tolerance: 8 },

  // Base Green
  { light: [0,166,81], dark: [0,200,100], name: 'BaseGreen700', tolerance: 10 },
  { light: [2,229,112], dark: [2,229,112], name: 'BaseGreen500', tolerance: 8 },
  { light: [0,191,89], dark: [0,210,100], name: 'BaseGreen600', tolerance: 8 },
  { light: [6,117,61], dark: [30,180,90], name: 'BaseGreen800', tolerance: 8 },

  // Star colors
  { light: [48,69,255], dark: [80,100,255], name: 'starblue', tolerance: 10 },
  { light: [230,63,7], dark: [255,90,50], name: 'starred', tolerance: 10 },
  { light: [229,64,8], dark: [255,90,50], name: 'tred', tolerance: 10 },

  // Categorical
  { light: [136,119,251], dark: [150,135,255], name: 'colora', tolerance: 10 },
  { light: [78,166,151], dark: [90,190,175], name: 'colorb', tolerance: 10 },
  { light: [235,116,115], dark: [255,130,130], name: 'colorc', tolerance: 10 },
  { light: [229,119,238], dark: [240,140,250], name: 'colord', tolerance: 10 },
  { light: [116,194,112], dark: [130,210,130], name: 'colore', tolerance: 10 },

  // Brand Accents
  { light: [255,102,44], dark: [255,120,70], name: 'ExpertOrange', tolerance: 10 },
  { light: [255,221,45], dark: [255,230,80], name: 'OptimYellow', tolerance: 12 },
  { light: [254,104,185], dark: [255,120,195], name: 'SurePink', tolerance: 10 },
  { light: [44,185,255], dark: [60,200,255], name: 'SureBlue', tolerance: 10 },
  { light: [217,184,254], dark: [200,170,255], name: 'CareViolet', tolerance: 10 },
  { light: [113,195,203], dark: [130,210,220], name: 'CareTiny', tolerance: 10 },
  { light: [227,255,124], dark: [200,230,100], name: 'OptimLime', tolerance: 12 },

  // Insight / Link
  { light: [228,198,230], dark: [60,45,65], name: 'insightpurple', tolerance: 10 },
  { light: [96,135,220], dark: [110,150,240], name: 'tlinkcolor', tolerance: 10 },

  // Misc
  { light: [56,140,70], dark: [70,170,90], name: 'mygreen', tolerance: 10 },
  { light: [45,112,179], dark: [70,140,210], name: 'myblue', tolerance: 10 },
  { light: [180,3,180], dark: [210,50,210], name: 'mypurple', tolerance: 10 }
];

export function rgbDistance(c1, c2) {
  return Math.sqrt(Math.pow(c1[0]-c2[0], 2) + Math.pow(c1[1]-c2[1], 2) + Math.pow(c1[2]-c2[2], 2));
}

export function invertLuminance(r, g, b) {
  const rf = r/255, gf = g/255, bf = b/255;
  const max = Math.max(rf,gf,bf), min = Math.min(rf,gf,bf);
  let h, s, l = (max+min)/2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    if (max === rf) h = ((gf-bf)/d + (gf<bf?6:0))/6;
    else if (max === gf) h = ((bf-rf)/d+2)/6;
    else h = ((rf-gf)/d+4)/6;
  }
  l = 1 - l;
  s = Math.min(1, s * 1.1);
  function hue2rgb(p,q,t) {
    if (t<0) t+=1; if (t>1) t-=1;
    if (t<1/6) return p+(q-p)*6*t;
    if (t<1/2) return q;
    if (t<2/3) return p+(q-p)*(2/3-t)*6;
    return p;
  }
  let rr, gg, bb;
  if (s === 0) { rr=gg=bb=l; }
  else {
    const q = l<0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    rr = hue2rgb(p,q,h+1/3);
    gg = hue2rgb(p,q,h);
    bb = hue2rgb(p,q,h-1/3);
  }
  return [Math.round(rr*255), Math.round(gg*255), Math.round(bb*255)];
}

export function mapColor(r, g, b, colorMap, fallback = 'invert') {
  let best = null;
  let bestDist = Infinity;
  for (const entry of colorMap) {
    const d = rgbDistance([r,g,b], entry.light);
    if (d <= entry.tolerance && d < bestDist) {
      bestDist = d;
      best = entry.dark;
    }
  }
  if (best) return best;
  if (fallback === 'invert') return invertLuminance(r, g, b);
  return [r, g, b];
}

function cmykToRgb(c, m, y, k) {
  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));
  return [r, g, b];
}

// Regex matching exactly sequences of numbers before color operators.
const CMYK_PAT = /(^|\s)(?<![\d.]\s)([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(k|K|sc|SC|scn|SCN)\b/g;
const RGB_PAT = /(^|\s)(?<![\d.]\s)([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(rg|RG|sc|SC|scn|SCN)\b/g;
const GREY_PAT = /(^|\s)(?<![\d.]\s)([\d.]+)\s+(g|G|sc|SC|scn|SCN)\b/g;

export function replaceColorsInStream(text, colorMap, fallback = 'invert', stats) {
  let newText = text;

  newText = newText.replace(CMYK_PAT, (match, prefix, p1, p2, p3, p4, op) => {
    const c = parseFloat(p1), m = parseFloat(p2), y = parseFloat(p3), k = parseFloat(p4);
    const [r, g, b] = cmykToRgb(c, m, y, k);
    const mapped = mapColor(r, g, b, colorMap, fallback);
    if (mapped[0] !== r || mapped[1] !== g || mapped[2] !== b) stats.replaced++;
    else stats.kept++;
    
    const isUpper = op === op.toUpperCase();
    const rgbOp = isUpper ? 'RG' : 'rg';
    return `${prefix}${(mapped[0]/255).toFixed(5)} ${(mapped[1]/255).toFixed(5)} ${(mapped[2]/255).toFixed(5)} ${rgbOp}`;
  });

  newText = newText.replace(RGB_PAT, (match, prefix, p1, p2, p3, op) => {
    const r = Math.round(parseFloat(p1) * 255);
    const g = Math.round(parseFloat(p2) * 255);
    const b = Math.round(parseFloat(p3) * 255);
    const mapped = mapColor(r, g, b, colorMap, fallback);
    if (mapped[0] !== r || mapped[1] !== g || mapped[2] !== b) stats.replaced++;
    else stats.kept++;
    
    const isUpper = op === op.toUpperCase();
    const rgbOp = isUpper ? 'RG' : 'rg';
    return `${prefix}${(mapped[0]/255).toFixed(5)} ${(mapped[1]/255).toFixed(5)} ${(mapped[2]/255).toFixed(5)} ${rgbOp}`;
  });

  newText = newText.replace(GREY_PAT, (match, prefix, p1, op) => {
    const val = parseFloat(p1);
    if (val < 0 || val > 1) return match;
    const grey = Math.round(val * 255);
    const mapped = mapColor(grey, grey, grey, colorMap, fallback);
    
    const isUpper = op === op.toUpperCase();
    if (mapped[0] === mapped[1] && mapped[1] === mapped[2]) {
      if (mapped[0] !== grey) stats.replaced++;
      else stats.kept++;
      const greyOp = isUpper ? 'G' : 'g';
      return `${prefix}${(mapped[0]/255).toFixed(5)} ${greyOp}`;
    } else {
      stats.replaced++;
      const rgbOp = isUpper ? 'RG' : 'rg';
      return `${prefix}${(mapped[0]/255).toFixed(5)} ${(mapped[1]/255).toFixed(5)} ${(mapped[2]/255).toFixed(5)} ${rgbOp}`;
    }
  });

  return newText;
}

export async function processPdfBytes(originalBytes, colorMap = DEFAULT_COLOR_MAP, fallback = 'invert', progressCb = null) {
  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true, updateMetadata: false });
  const context = pdfDoc.context;
  const stats = { replaced: 0, kept: 0, pages: pdfDoc.getPageCount() };

  const totalPages = pdfDoc.getPageCount();
  const streamsToProcess = new Set();

  // 1. Collect all Page Contents
  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const contentsObj = page.node.get(PDFName.of('Contents'));
    if (!contentsObj) continue;
    
    if (typeof contentsObj.size === 'function') {
      for (let j = 0; j < contentsObj.size(); j++) {
        streamsToProcess.add(contentsObj.get(j));
      }
    } else {
      streamsToProcess.add(contentsObj);
    }
  }

  // 2. Collect all Form XObjects globally
  const allObjects = context.enumerateIndirectObjects();
  for (const [ref, obj] of allObjects) {
    if (obj && typeof obj.get === 'function') {
      const subtype = obj.get(PDFName.of('Subtype'));
      if (subtype && subtype.toString() === '/Form') {
        streamsToProcess.add(ref);
      }
    }
  }

  // 3. Process all collected streams
  let currentStreamIndex = 0;
  const totalStreams = streamsToProcess.size;

  for (const ref of streamsToProcess) {
    if (progressCb) progressCb(currentStreamIndex++, totalStreams);
    if (!ref) continue;

    const streamObj = ref instanceof PDFRef ? context.lookup(ref) : ref;
    if (!streamObj || (!streamObj.getContents && !streamObj.contents)) continue;

      try {
        const streamBytes = typeof streamObj.getContents === 'function' ? streamObj.getContents() : streamObj.contents;
        
        let text;
        const filterName = streamObj.dict?.get(PDFName.of('Filter'))?.toString() || '';
        
        if (filterName.includes('FlateDecode')) {
          try {
            const inflated = pako.inflate(streamBytes);
            text = new TextDecoder('latin1').decode(inflated);
          } catch {
            text = new TextDecoder('latin1').decode(streamBytes);
          }
        } else {
          text = new TextDecoder('latin1').decode(streamBytes);
        }

        const newText = replaceColorsInStream(text, colorMap, fallback, stats);

        if (newText !== text) {
          const latin1Bytes = new Uint8Array(newText.length);
          for (let c = 0; c < newText.length; c++) {
            latin1Bytes[c] = newText.charCodeAt(c) & 0xFF;
          }
          const compressed = pako.deflate(latin1Bytes);
          const newStream = context.stream(compressed, {
            Filter: PDFName.of('FlateDecode'),
            Length: compressed.length,
            ...streamObj.dict?.dict
          });

          if (ref instanceof PDFRef) {
            context.assign(ref, newStream);
          }
        }
      } catch (e) {
        console.warn(`Stream error:`, e);
      }
    }

  addDarkBackground(pdfDoc);

  const darkBytes = await pdfDoc.save();
  return { darkBytes, stats };
}

// Helper to add background
export function addDarkBackground(pdfDoc) {
  const context = pdfDoc.context;
  const bgBytes = new TextEncoder().encode(`q 0.078 0.078 0.094 rg 0 0 5000 5000 re f Q\n`);
  
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const bgStream = context.stream(bgBytes, { Length: bgBytes.length });
    const bgRef = context.register(bgStream);
    
    let contents = page.node.get(PDFName.of('Contents'));
    if (!contents) continue;
    
    if (typeof contents.push === 'function') {
      // It's an array. We must insert at the beginning.
      // Unshift is not supported by PDFArray directly.
      const arr = context.obj([bgRef]);
      for (let i=0; i<contents.size(); i++) arr.push(contents.get(i));
      page.node.set(PDFName.of('Contents'), arr);
    } else {
      // Single stream
      const arr = context.obj([bgRef, contents]);
      page.node.set(PDFName.of('Contents'), arr);
    }
  }
}
