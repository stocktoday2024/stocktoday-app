import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseMultiLang, getLocalised } from "./index";

describe("Multilingual Parsers and Fallbacks", () => {
  it("should parse valid JSON multilingual content", () => {
    const raw = JSON.stringify({
      en: "Nifty hits record high",
      gu: "નિફ્ટીએ રેકોર્ડ હાઈ બનાવી",
      hi: "निफ्टी ने रिकॉर्ड ऊंचाई बनाई",
    });

    const parsed = parseMultiLang(raw);
    assert.equal(parsed.en, "Nifty hits record high");
    assert.equal(parsed.gu, "નિફ્ટીએ રેકોર્ડ હાઈ બનાવી");
    assert.equal(parsed.hi, "निफ्टी ने रिकॉर्ड ऊंचाई बनाई");
  });

  it("should handle null or invalid JSON gracefully", () => {
    assert.deepEqual(parseMultiLang(null), { en: "", gu: "", hi: "" });
    assert.deepEqual(parseMultiLang("plain string text"), {
      en: "plain string text",
      gu: "",
      hi: "",
    });
  });

  it("should return requested locale if present without fallback badge", () => {
    const ml = {
      en: "English Title",
      gu: "ગુજરાતી શીર્ષક",
      hi: "हिन्दी शीर्षक",
    };

    const resGu = getLocalised(ml, "GU");
    assert.equal(resGu.text, "ગુજરાતી શીર્ષક");
    assert.equal(resGu.isFallback, false);

    const resHi = getLocalised(ml, "HI");
    assert.equal(resHi.text, "हिन्दी शीर्षक");
    assert.equal(resHi.isFallback, false);
  });

  it("should fall back to English if Gujarati or Hindi translation is empty", () => {
    const ml = {
      en: "English Title",
      gu: "",
      hi: "   ",
    };

    const resGu = getLocalised(ml, "GU");
    assert.equal(resGu.text, "English Title");
    assert.equal(resGu.isFallback, true);

    const resHi = getLocalised(ml, "HI");
    assert.equal(resHi.text, "English Title");
    assert.equal(resHi.isFallback, true);
  });
});
