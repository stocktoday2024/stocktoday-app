// High-Accuracy Financial News Translation Engine for StockToday
// Supporting full bidirectional translation across English (EN), Gujarati (GU), and Hindi (HI).
// Preserves HTML structure, financial figures (₹, $, Cr, Lakh), percentages, tickers (TATAMOTORS, RELIANCE), and metrics.

export function detectScriptLanguage(text: string): "EN" | "GU" | "HI" | "UNKNOWN" {
  if (!text || !text.trim()) return "UNKNOWN";
  // Remove HTML tags for detection
  const clean = text.replace(/<[^>]*>/g, "");
  // Gujarati script range: U+0A80 to U+0AFF
  if (/[\u0A80-\u0AFF]/.test(clean)) return "GU";
  // Devanagari (Hindi) script range: U+0900 to U+097F
  if (/[\u0900-\u097F]/.test(clean)) return "HI";
  // Latin / English range: A-Z, a-z
  if (/[a-zA-Z]/.test(clean)) return "EN";
  return "UNKNOWN";
}

export function validateTargetScript(text: string, targetLang: "EN" | "GU" | "HI"): boolean {
  if (!text || !text.trim()) return false;
  const clean = text.replace(/<[^>]*>/g, "").trim();
  if (!clean) return true;

  if (targetLang === "GU") {
    // Must contain Gujarati characters
    return /[\u0A80-\u0AFF]/.test(clean);
  }
  if (targetLang === "HI") {
    // Must contain Devanagari characters
    return /[\u0900-\u097F]/.test(clean);
  }
  if (targetLang === "EN") {
    // Must contain Latin characters and not be purely Indic script
    return /[a-zA-Z]/.test(clean) && !/[\u0A80-\u0AFF]/.test(clean) && !/[\u0900-\u097F]/.test(clean);
  }
  return true;
}

export async function translateContent({
  text,
  sourceLang,
  targetLang,
}: {
  text: string;
  sourceLang: "EN" | "GU" | "HI";
  targetLang: "EN" | "GU" | "HI";
}): Promise<string> {
  const trimmed = (text || "").trim();
  if (!trimmed) return "";
  if (sourceLang === targetLang) return trimmed;

  // 1. Check if Gemini / Google Cloud API Key is configured in environment
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const prompt = `You are an expert Indian stock market financial news editor and translator.
Translate the following text from ${sourceLang} to ${targetLang}.
CRITICAL RULES:
- Output MUST be genuinely translated into the authentic native script of ${targetLang} (${targetLang === "GU" ? "Gujarati script (ગુજરાતી)" : targetLang === "HI" ? "Devanagari script (हिन्दी)" : "English (Latin)"}).
- NEVER leave English or untranslated sentences in the output.
- Preserve all HTML formatting (<p>, <h3>, <strong>, <em>, <ul>, <li>, <blockquote>, <a>) and their exact structural positioning.
- Preserve stock tickers (e.g. TATAMOTORS, RELIANCE, HDFCBANK, NIFTY 50), monetary signs (₹, $, Cr, Lakh), percentages (%), and numerical metrics intact.
- Respond ONLY with the translated text and nothing else.

Content to translate:
${trimmed}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && candidate.trim().length > 0) {
          const res = candidate.trim();
          if (validateTargetScript(res, targetLang)) {
            return res;
          }
        }
      }
    } catch (err) {
      console.warn("External Gemini API call error, trying neural translation engine:", err);
    }
  }

  // 2. High-Fidelity Multi-Segment Neural Translation Engine
  try {
    const sl = sourceLang.toLowerCase();
    const tl = targetLang.toLowerCase();

    // Split text into manageable chunks if very long or contains multiple paragraphs
    // to avoid URL length constraints while preserving HTML tags
    const paragraphs = trimmed.split(/(\n\n+|<p>.*?<\/p>|<h3>.*?<\/h3>|<li>.*?<\/li>)/gs).filter(Boolean);

    if (paragraphs.length <= 1) {
      const translated = await fetchGoogleTranslate(trimmed, sl, tl);
      if (validateTargetScript(translated, targetLang)) {
        return translated;
      }
    } else {
      const translatedParts: string[] = [];
      for (const p of paragraphs) {
        if (!p.trim()) {
          translatedParts.push(p);
          continue;
        }
        const res = await fetchGoogleTranslate(p, sl, tl);
        translatedParts.push(res);
      }
      const combined = translatedParts.join("");
      if (validateTargetScript(combined, targetLang)) {
        return combined;
      }
    }
  } catch (err) {
    console.warn("Neural translation API failed:", err);
  }

  // 3. If translation fails, throw an explicit error rather than silently returning English text!
  throw new Error(
    `Failed to generate authentic ${targetLang === "GU" ? "Gujarati" : targetLang === "HI" ? "Hindi" : "English"} translation for field. Please ensure network connectivity.`
  );
}

async function fetchGoogleTranslate(text: string, sl: string, tl: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Google translate returned status ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const segments = data[0].map((item: any) => item[0]).filter(Boolean);
    return segments.join("");
  }

  throw new Error("Invalid response format from translation service");
}
