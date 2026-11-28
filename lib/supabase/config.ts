// Environment values can acquire line breaks or wrapping quotes when pasted.
export function normalizeSupabaseConfig(value: string): string {
  return value
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\[rnt]/g, '')
    .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
}
