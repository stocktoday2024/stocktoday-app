/**
 * HTML Sanitizer for Rich Text & Content Fields
 * Strips script tags, javascript: event handlers, iframes, and malicious XSS vectors.
 */

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  // 1. Remove dangerous script and iframe elements
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<link\b[^<]*>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 2. Remove inline JavaScript event handlers (e.g. onload, onerror, onclick)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // 3. Remove javascript: pseudo-protocol in href or src
  clean = clean.replace(/(href|src)\s*=\s*(?:['"]javascript:[^'"]*['"]|javascript:[^\s>]+)/gi, '$1="#"');

  // 4. Remove data: text/html in href or src
  clean = clean.replace(/(href|src)\s*=\s*(?:['"]data:text\/html[^'"]*['"]|data:text\/html[^\s>]+)/gi, '$1="#"');

  return clean;
}
