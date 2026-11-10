import { breakPage, drawImage, imageData, preparePaper, renderPaper, writeAnswer, writeLines } from "@/lib/quiz-paper";
import {
  builtSentence,
  expressions,
  feelings,
  objectiveScore,
  sayScenes,
  sentenceRight,
  type ExprId,
  type SayId,
} from "@/data/officer-quiz";
import type { Shape } from "@/data/lovely-quiz";

export type OfficerSheet = {
  name: string;
  className: string;
  say: Record<SayId, Record<string, string | null>>;
  faces: Array<ExprId | null>;
  crime: string;
  reward: string;
  who: string;
  shapes: Shape[];
  posterImage: string;
};

const sayOrder: SayId[] = ["run", "phone", "bus"];

export async function downloadOfficerSheet(sheet: OfficerSheet) {
  const paper = await preparePaper();
  const marks = objectiveScore({ say: sheet.say, faces: sheet.faces });
  const scenes = await Promise.all(sayOrder.map((id) => imageData(sayScenes[id].image)));
  const faces = await Promise.all(
    sheet.faces.map((picked) => {
      const src = expressions.find((item) => item.id === picked)?.src;
      return src ? imageData(src) : Promise.resolve(null);
    }),
  );

  let y = 18;
  y = writeLines(paper, y, "Officer Robo - Quiz", 26);
  y = writeLines(paper, y + 1, `Name: ${sheet.name || "—"}          Class: ${sheet.className || "—"}`, 16);
  y = writeLines(paper, y, `Marked questions: ${marks.total} / 7`, 16);
  y = writeLines(paper, y, "Poster (teacher): Picture ___   Sentence ___   Gender ___   = ___ / 3", 14);
  y = writeLines(paper, y, "Total: ___ / 10", 16);
  y += 2;

  for (let index = 0; index < sayOrder.length; index++) {
    const id = sayOrder[index];
    const right = sentenceRight(id, sheet.say[id]);
    y = await writeAnswer(
      paper,
      y,
      `${index + 1}. ${builtSentence(id, sheet.say[id])}  (${right ? "1" : "0"} / 1)`,
      scenes[index],
    );
  }

  for (let index = 0; index < sheet.faces.length; index++) {
    const picked = sheet.faces[index];
    const question = feelings[index];
    const right = picked !== null && question.answers.includes(picked);
    const label = expressions.find((item) => item.id === picked)?.label ?? "No face";
    y = await writeAnswer(paper, y, `${index + 4}. "${question.line}"  ${label}  (${right ? "1" : "0"} / 1)`, faces[index]);
  }

  const poster = `WANTED FOR ${sheet.crime.trim() || "—"}. $${sheet.reward.trim() || "—"} reward. If you see this ${sheet.who || "—"}, please tell the police!`;
  y = await writeAnswer(paper, y, `8. ${poster}  (___ / 3)`, sheet.posterImage || null);
  writeLines(paper, y, `Drawings: ${sheet.shapes.length}`, 14);

  if (sheet.posterImage) {
    breakPage(paper);
    writeLines(paper, 16, "Wanted poster", 26);
    await drawImage(paper, sheet.posterImage, 48, 32, 110, 156);
  }

  const safeName = sheet.name.trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "pupil";
  const safeClass = sheet.className.trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
  const filename = `Officer-Robo-${[safeClass, safeName].filter(Boolean).join("-")}-${stamp()}.pdf`;
  const doc = renderPaper(paper);
  return { filename, blob: doc.output("blob") as Blob };
}

function stamp() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}
