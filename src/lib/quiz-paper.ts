import { jsPDF } from "jspdf";
import { loadQuizFonts } from "@/lib/quiz-fonts";

const PX = 5;
const BOTTOM = 288;

type Sheet = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};

export type Paper = {
  pages: Sheet[];
  page: Sheet;
};

function makeSheet(): Sheet {
  const canvas = document.createElement("canvas");
  canvas.width = 210 * PX;
  canvas.height = 297 * PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not start the quiz paper.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#14100c";
  ctx.textBaseline = "top";
  return { canvas, ctx };
}

export async function preparePaper(): Promise<Paper> {
  await loadQuizFonts();
  await document.fonts.load("64px 'KG Primary Penmanship'");
  await document.fonts.ready;
  const page = makeSheet();
  return { pages: [page], page };
}

export function breakPage(paper: Paper) {
  paper.page = makeSheet();
  paper.pages.push(paper.page);
  return 16;
}

function fontPx(size: number) {
  return size * PX * 0.353;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxPx: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxPx && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function usePen(ctx: CanvasRenderingContext2D, size: number) {
  ctx.font = `${fontPx(size)}px "KG Primary Penmanship"`;
  ctx.fillStyle = "#14100c";
  ctx.textBaseline = "top";
}

export function writeLines(paper: Paper, y: number, text: string, size: number, x = 14, width = 182) {
  usePen(paper.page.ctx, size);
  const lines = wrap(paper.page.ctx, text, width * PX);
  const lineMm = size * 0.48;
  const block = lines.length * lineMm;
  if (y + block > BOTTOM && y > 24) y = breakPage(paper);
  const ctx = paper.page.ctx;
  usePen(ctx, size);
  lines.forEach((line, index) => ctx.fillText(line, x * PX, (y + index * lineMm) * PX));
  return y + block + 1.1;
}

async function decode(src: string) {
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
  } catch {
    return null;
  }
  return img.naturalWidth ? img : null;
}

function fit(width: number, height: number, maxW: number, maxH: number) {
  const scale = Math.min(maxW / width, maxH / height);
  return { w: width * scale, h: height * scale };
}

export async function writeAnswer(paper: Paper, y: number, text: string, picture: string | null) {
  const size = 15;
  const img = picture ? await decode(picture) : null;
  let iw = 0;
  let ih = 0;
  if (img) {
    const box = fit(img.naturalWidth, img.naturalHeight, 38, 22);
    iw = box.w;
    ih = box.h;
  }
  const textX = img ? 14 + iw + 3.5 : 14;
  const textW = Math.max(40, 196 - textX);
  usePen(paper.page.ctx, size);
  const lines = wrap(paper.page.ctx, text, textW * PX);
  const lineMm = size * 0.46;
  const textH = lines.length * lineMm;
  const row = Math.max(ih, textH);
  if (y + row > BOTTOM && y > 24) y = breakPage(paper);
  const ctx = paper.page.ctx;
  if (img) {
    ctx.drawImage(img, 14 * PX, y * PX, iw * PX, ih * PX);
    ctx.strokeStyle = "#1a1008";
    ctx.lineWidth = 2;
    ctx.strokeRect(14 * PX, y * PX, iw * PX, ih * PX);
  }
  usePen(ctx, size);
  const textY = y + Math.max(0, (ih - textH) / 2);
  lines.forEach((line, index) => ctx.fillText(line, textX * PX, (textY + index * lineMm) * PX));
  return y + row + 3;
}

export async function drawImage(paper: Paper, src: string, x: number, y: number, w: number, h: number) {
  const img = await decode(src);
  if (!img) return;
  paper.page.ctx.drawImage(img, x * PX, y * PX, w * PX, h * PX);
}

export function renderPaper(paper: Paper) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  paper.pages.forEach((page, index) => {
    if (index > 0) doc.addPage();
    const url = page.canvas.toDataURL("image/jpeg", 0.86);
    page.canvas.width = 1;
    page.canvas.height = 1;
    doc.addImage(url, "JPEG", 0, 0, 210, 297);
  });
  return doc;
}

export function blobBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result);
      resolve(data.slice(data.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the sheet."));
    reader.readAsDataURL(blob);
  });
}

export async function imageData(src: string) {
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  const response = await fetch(src);
  if (!response.ok) return null;
  const blob = await response.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function answerCard(text: string) {
  await document.fonts.load("48px 'KG Primary Penmanship'");
  const canvas = document.createElement("canvas");
  canvas.width = 520;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fff8f2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#5b18c9";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = "#1a1008";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "46px 'KG Primary Penmanship'";
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > 460 && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  const shown = lines.slice(0, 4);
  const start = canvas.height / 2 - ((shown.length - 1) * 54) / 2;
  shown.forEach((row, index) => ctx.fillText(row, canvas.width / 2, start + index * 54));
  return canvas.toDataURL("image/jpeg", 0.92);
}
