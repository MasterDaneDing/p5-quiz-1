import { paintShapes } from "@/lib/poster";
import { loadQuizFonts } from "@/lib/quiz-fonts";
import type { Shape } from "@/data/lovely-quiz";

const W = 900;
const H = 1280;

function cover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  iw: number,
  ih: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / iw, height / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.drawImage(img, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
  ctx.restore();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export async function renderWanted(options: {
  photo: string;
  shapes: Shape[];
  crime: string;
  reward: string;
  who: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  await loadQuizFonts();
  ctx.fillStyle = "#f3e2c4";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#2a1a0c";
  ctx.lineWidth = 18;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  await document.fonts.load("92px Wanted");
  ctx.fillStyle = "#1a1008";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "92px Wanted";
  ctx.fillText("WANTED!", W / 2, 120);

  const faceX = 150;
  const faceY = 190;
  const faceW = 600;
  const faceH = 520;
  ctx.fillStyle = "#f7edd8";
  ctx.fillRect(faceX, faceY, faceW, faceH);
  ctx.strokeStyle = "#1a1008";
  ctx.lineWidth = 8;
  ctx.strokeRect(faceX, faceY, faceW, faceH);
  if (options.photo) {
    const img = new Image();
    img.src = options.photo;
    await img.decode();
    cover(ctx, img, img.naturalWidth, img.naturalHeight, faceX, faceY, faceW, faceH);
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(faceX, faceY, faceW, faceH);
  ctx.clip();
  ctx.translate(faceX, faceY);
  paintShapes(ctx, options.shapes, faceW, faceH);
  ctx.restore();

  const crime = (options.crime.trim() || "_______________").toUpperCase();
  const reward = (options.reward.trim() || "_______").toUpperCase();
  const who = (options.who || "BOY / GIRL").toUpperCase();
  await document.fonts.load("64px 'KG Primary Penmanship'");
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#1a1008";
  ctx.strokeStyle = "#1a1008";
  ctx.lineJoin = "round";
  ctx.lineWidth = 10;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "54px 'KG Primary Penmanship'";
  let y = 780;
  const ink = (line: string, size: number) => {
    ctx.font = `${size}px 'KG Primary Penmanship'`;
    ctx.lineWidth = Math.max(3, size / 16);
    ctx.strokeText(line, W / 2, y);
    ctx.fillText(line, W / 2, y);
    y += size + 18;
  };
  for (const line of wrap(ctx, `WANTED FOR ${crime}`, W - 120)) ink(line, 54);
  for (const line of wrap(ctx, `$${reward} REWARD`, W - 120)) ink(line, 58);
  y += 6;
  for (const line of wrap(ctx, `IF YOU SEE THIS ${who}, PLEASE TELL THE POLICE!`, W - 120)) ink(line, 46);
  ctx.restore();
  return canvas.toDataURL("image/jpeg", 0.92);
}
