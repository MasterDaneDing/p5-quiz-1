import type { Shape } from "@/data/lovely-quiz";

export const POSTER_W = 1200;
export const POSTER_H = 800;

export function paintShapes(ctx: CanvasRenderingContext2D, shapes: Shape[], width: number, height: number) {
  for (const shape of shapes) {
    const tool = shape.tool ?? "brush";
    if (shape.pts.length < (tool === "pen" ? 2 : 3)) continue;
    ctx.beginPath();
    shape.pts.forEach((pt, i) => {
      const x = pt.x * width;
      const y = pt.y * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (tool === "pen") {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = Math.max(10, width / 70);
      ctx.stroke();
      continue;
    }
    ctx.closePath();
    ctx.fillStyle = shape.color;
    ctx.fill();
    ctx.lineWidth = Math.max(6, width / 160);
    ctx.strokeStyle = "#1a1028";
    ctx.stroke();
  }
}

function cover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  iw: number,
  ih: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / iw, height / ih);
  const w = iw * scale;
  const h = ih * scale;
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
}

export async function renderPoster(options: {
  background: string;
  shapes: Shape[];
  line: string;
}): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_W;
  canvas.height = POSTER_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#3a0d86";
  ctx.fillRect(0, 0, POSTER_W, POSTER_H);
  if (options.background) {
    const img = new Image();
    img.src = options.background;
    await img.decode();
    cover(ctx, img, img.naturalWidth, img.naturalHeight, POSTER_W, POSTER_H);
  }
  paintShapes(ctx, options.shapes, POSTER_W, POSTER_H);
  const band = 150;
  ctx.fillStyle = "rgba(255,248,242,0.94)";
  ctx.fillRect(0, POSTER_H - band, POSTER_W, band);
  await document.fonts.load("72px 'Super Chips'");
  ctx.fillStyle = "#2a0845";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = options.line.trim() || " ";
  let size = 64;
  ctx.font = `${size}px "Super Chips"`;
  while (size > 22 && ctx.measureText(text).width > POSTER_W - 80) {
    size -= 2;
    ctx.font = `${size}px "Super Chips"`;
  }
  ctx.fillText(text, POSTER_W / 2, POSTER_H - band / 2);
  return canvas.toDataURL("image/jpeg", 0.86);
}
