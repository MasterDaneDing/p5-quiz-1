/** Public-file URL. `/` in preview, `/p5-quiz-1/` on GitHub Pages. */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path.replace(/^\//, "")}`;
}
