const families = [
  ["Super Chips", "super-chips.woff2"],
  ["KG Perfect Penmanship", "kg-perfect-penmanship.woff2"],
  ["KG Primary Penmanship", "kg-primary-penmanship.woff2"],
  ["Wanted", "wanted.woff2"],
] as const;

let loading: Promise<void> | null = null;

/** Phones do not have these fonts installed. Load the files, then paint a
 * hidden sample so iPhone canvas drawing can see them too. */
export function loadQuizFonts(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    if (typeof document === "undefined") return;
    const base = import.meta.env.BASE_URL || "/";
    await Promise.all(
      families.map(async ([family, file]) => {
        try {
          const face = new FontFace(`"${family}"`, `url(${base}fonts/${file})`, {
            weight: "400",
            style: "normal",
            display: "swap",
          });
          await face.load();
          document.fonts.add(face);
        } catch (err) {
          console.warn(`Could not load ${family}`, err);
        }
      }),
    );
    const probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    for (const [family] of families) {
      const span = document.createElement("span");
      span.style.fontFamily = `"${family}"`;
      span.textContent = "Ag";
      probe.appendChild(span);
    }
    document.body.appendChild(probe);
    await document.fonts.ready;
  })();
  return loading;
}
