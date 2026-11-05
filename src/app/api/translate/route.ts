import { auth } from "@/lib/auth";
import { translateContent, detectScriptLanguage, validateTargetScript } from "@/lib/translation";
import { recordAuditLog } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit translation calls per user
  const rateCheck = checkRateLimit(`translate:${session.user.id}`, 30, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please wait a moment before requesting further translations." }, { status: 429 });
  }

  try {
    const { fields, sourceLang = "EN" } = await req.json();

    if (!fields || typeof fields !== "object") {
      return NextResponse.json({ error: "Missing required fields object" }, { status: 400 });
    }

    const validLangs: ("EN" | "GU" | "HI")[] = ["EN", "GU", "HI"];
    let detectedSource = validLangs.includes(sourceLang) ? sourceLang : "EN";

    // Auto-verify source language script if user entered in Gujarati or Hindi
    const firstNonEmpty = (fields.title || fields.summary || fields.body || "").trim();
    if (firstNonEmpty) {
      const script = detectScriptLanguage(firstNonEmpty);
      if (script !== "UNKNOWN") {
        detectedSource = script;
      }
    }

    const targetLangs = validLangs.filter((l) => l !== detectedSource);

    // Prepare structure: { gu: { title, summary, simpleExplain, body }, hi: { ... } }
    const translations: Record<string, Record<string, string>> = {};
    for (const tLang of targetLangs) {
      translations[tLang.toLowerCase()] = {};
    }

    const fieldKeys = ["title", "summary", "simpleExplain", "body"];
    const errors: string[] = [];
    const missingFields: string[] = [];

    for (const key of fieldKeys) {
      const sourceText = (fields[key] || "").trim();

      if (!sourceText) {
        // If source field is empty, target field is empty
        for (const targetLang of targetLangs) {
          translations[targetLang.toLowerCase()][key] = "";
          missingFields.push(`${targetLang} ${key} (Source field was empty)`);
        }
        continue;
      }

      for (const targetLang of targetLangs) {
        const langKey = targetLang.toLowerCase();

        try {
          const translated = await translateContent({
            text: sourceText,
            sourceLang: detectedSource,
            targetLang,
          });

          // Strict Script Validation
          if (!validateTargetScript(translated, targetLang)) {
            errors.push(
              `${targetLang} ${key}: Translation did not produce genuine ${
                targetLang === "GU" ? "Gujarati" : targetLang === "HI" ? "Hindi" : "English"
              } script.`
            );
            translations[langKey][key] = "";
          } else {
            translations[langKey][key] = translated;
          }
        } catch (err: any) {
          errors.push(`${targetLang} ${key}: ${err.message || "Translation failed"}`);
          translations[langKey][key] = "";
        }
      }
    }

    const isComplete = errors.length === 0 && missingFields.length === 0;

    await recordAuditLog({
      userId: session.user.id,
      action: "TRANSLATION_GENERATE",
      meta: {
        sourceLang: detectedSource,
        targetLangs,
        isComplete,
        errorCount: errors.length,
      },
    });

    if (errors.length > 0 && Object.values(translations).every((obj) => Object.values(obj).every((v) => !v))) {
      // If everything failed
      return NextResponse.json(
        {
          error: `Translation failed: ${errors.join("; ")}`,
          errors,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: isComplete,
      sourceLang: detectedSource,
      translations,
      isComplete,
      errors: errors.length > 0 ? errors : undefined,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
    });
  } catch (err: unknown) {
    console.error("Translation API error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
