export type WritingLanguage = "zh" | "ko" | "en";

/**
 * Infer the writing language from a free-text brief/premise when the user did not set one explicitly.
 *
 * Conservative by design: defaults to "zh" (preserving prior behaviour for Chinese users) and only
 * returns "en" when the text is clearly Latin-dominant. A Chinese brief that mentions an English name
 * or term still resolves to "zh"; incidental CJK inside an otherwise English brief resolves to "en".
 * Hangul-dominant text resolves to "ko".
 */
export function inferLanguage(text?: string | null): WritingLanguage {
  const t = text ?? "";
  const han = (t.match(/[一-鿿]/g) ?? []).length;
  const hangul = (t.match(/[가-힣]/g) ?? []).length;
  const latin = (t.match(/[A-Za-z]/g) ?? []).length;
  if (hangul > 0 && hangul >= han && hangul >= latin) return "ko";
  if (han === 0 && latin > 0) return "en";
  if (latin > 0 && (han + hangul) * 4 < latin) return "en";
  return "zh";
}
