import { answerCard, breakPage, drawImage, imageData, preparePaper, renderPaper, writeAnswer, writeLines } from "@/lib/quiz-paper";
import { faceQuestions, faces, mcQuestions, objectiveScore, type Face, type Shape } from "@/data/lovely-quiz";

export type LovelySheet = {
  name: string;
  className: string;
  mc: Array<number | null>;
  faces: Array<Face | null>;
  modal: string;
  posterText: string;
  school: [string, string, string];
  shapes: Shape[];
  posterImage: string;
};

const faceWord: Record<Face, string> = { happy: "Happy face", angry: "Angry face" };

export async function downloadLovelySheet(sheet: LovelySheet) {
  const paper = await preparePaper();
  const marks = objectiveScore({ mc: sheet.mc, faces: sheet.faces, school: sheet.school });
  const facePictures = await Promise.all(
    sheet.faces.map((picked) => (picked ? imageData(faces[picked].src) : Promise.resolve(null))),
  );
  const choiceCards = await Promise.all(
    mcQuestions.map((question, index) => {
      const picked = sheet.mc[index];
      const chosen = picked === null || picked === undefined ? "No answer" : question.choices[picked];
      return answerCard(chosen);
    }),
  );
  const school = sheet.school.map((word) => word.trim()).filter(Boolean).join(" ");
  const schoolCard = await answerCard(school ? `${school} School` : "No school");

  let y = 18;
  y = writeLines(paper, y, "Lovely School - Quiz", 26);
  y = writeLines(paper, y + 1, `Name: ${sheet.name || "—"}          Class: ${sheet.className || "—"}`, 16);
  y = writeLines(paper, y, `Marked questions: ${marks.total} / 7`, 16);
  y = writeLines(paper, y, "Poster (teacher): Picture ___   Spelling ___   Rule makes sense ___   = ___ / 3", 14);
  y = writeLines(paper, y, "Total: ___ / 10", 16);
  y += 2;

  for (let index = 0; index < mcQuestions.length; index++) {
    const question = mcQuestions[index];
    const picked = sheet.mc[index];
    const right = picked === question.answer;
    const chosen = picked === null || picked === undefined ? "No answer" : question.choices[picked];
    y = await writeAnswer(
      paper,
      y,
      `${index + 1}. ${question.prompt}  Answer: ${chosen}  (${right ? "1" : "0"} / 1)`,
      choiceCards[index],
    );
  }

  for (let index = 0; index < sheet.faces.length; index++) {
    const picked = sheet.faces[index];
    const question = faceQuestions[index];
    const right = picked === question.answer;
    y = await writeAnswer(
      paper,
      y,
      `${index + 4}. "${question.line}"  ${picked ? faceWord[picked] : "No face"}  (${right ? "1" : "0"} / 1)`,
      facePictures[index],
    );
  }

  const posterLine = `${sheet.modal} ${sheet.posterText}`.trim();
  y = await writeAnswer(paper, y, `7. Poster: ${posterLine || "No poster"}  (___ / 3)`, sheet.posterImage || null);
  y = await writeAnswer(paper, y, `8. ${school || "—"} School  (${marks.school} / 1)`, schoolCard);
  writeLines(paper, y, `Drawings: ${sheet.shapes.length}`, 14);

  if (sheet.posterImage) {
    breakPage(paper);
    writeLines(paper, 16, "School poster", 26);
    await drawImage(paper, sheet.posterImage, 14, 32, 180, 120);
  }

  const safeName = sheet.name.trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "pupil";
  const safeClass = sheet.className.trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
  const filename = `Lovely-School-${[safeClass, safeName].filter(Boolean).join("-")}-${stamp()}.pdf`;
  const doc = renderPaper(paper);
  return { filename, blob: doc.output("blob") as Blob };
}

function stamp() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}
