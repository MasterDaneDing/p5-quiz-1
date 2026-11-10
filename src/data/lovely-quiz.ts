import { assetUrl } from "@/lib/asset-url";

export type Face = "happy" | "angry";

export type Choice = { text: string };

export type McQuestion = {
  id: "dress" | "children" | "begin";
  prompt: string;
  lead?: string;
  choices: string[];
  answer: number;
};

export const mcQuestions: McQuestion[] = [
  {
    id: "dress",
    prompt: "How should we dress for school?",
    lead: "We should dress:",
    choices: ["Untidily", "Tidily", "Mummy should dress us", "Messily"],
    answer: 1,
  },
  {
    id: "children",
    prompt: "How do children dress in Lovely School?",
    choices: ["Untidily", "Tidily", "In a T-shirt", "In a dress"],
    answer: 0,
  },
  {
    id: "begin",
    prompt: "When does school begin in Lovely School?",
    choices: ["Eight o'clock", "Half past eight", "Eighty o'clock", "Before eight o'clock"],
    answer: 0,
  },
];

export type FaceQuestion = {
  id: string;
  line: string;
  child: string;
  childAlt: string;
  answer: Face;
};

export const faceQuestions: FaceQuestion[] = [
  {
    id: "asleep",
    line: "I fell asleep in the classroom!",
    child: assetUrl("/quiz/child-snot.jpg"),
    childAlt: "A boy with a runny nose",
    answer: "angry",
  },
  {
    id: "lunch",
    line: "I cooked lunch in the classroom!",
    child: assetUrl("/quiz/child-wave-boy.jpg"),
    childAlt: "A boy waving",
    answer: "angry",
  },
  {
    id: "bed",
    line: "I went to bed early!",
    child: assetUrl("/quiz/child-girl.jpg"),
    childAlt: "A girl waving",
    answer: "happy",
  },
];

export const modals = ["We should", "We shouldn't", "We must", "We mustn't"] as const;

export type Modal = (typeof modals)[number];

export const backgrounds = [
  { id: "classroom", label: "Classroom", src: assetUrl("/quiz/classroom.jpg") },
  { id: "playground", label: "Playground", src: assetUrl("/quiz/playground.jpg") },
  { id: "library", label: "Library", src: assetUrl("/quiz/library.jpg") },
] as const;

export type BgId = (typeof backgrounds)[number]["id"] | "photo";

export const faces = {
  happy: { src: assetUrl("/quiz/principal-happy.png"), label: "Smiling principal" },
  angry: { src: assetUrl("/quiz/principal-angry.png"), label: "Cross principal" },
} as const;

export const posterColours = ["#ff6a00", "#ff2ea6", "#5b18c9", "#e8ff3d", "#168a5a", "#1d4ed8", "#e11d48", "#1a1028"];

export const skinColours = ["#f6e2c8", "#e7b98a", "#c68642", "#8d5524", "#5c3317", "#3d2314"];

export const brownColours = ["#e6c39a", "#c4925a", "#8b5a2b", "#6b3e26", "#4a2c17", "#2c1a10"];

export type Pt = { x: number; y: number };
export type DrawTool = "brush" | "pen";
export type Shape = { pts: Pt[]; color: string; tool: DrawTool };

export function schoolIsRight(words: [string, string, string]) {
  const clean = words.map((word) => word.trim().toLowerCase().replace(/[^a-z]/g, ""));
  return clean[0] === "tung" && clean[1] === "chung" && clean[2] === "catholic";
}

export function objectiveScore(input: {
  mc: Array<number | null>;
  faces: Array<Face | null>;
  school: [string, string, string];
}) {
  const mcMarks = input.mc.reduce<number>((sum, picked, i) => sum + (picked === mcQuestions[i].answer ? 1 : 0), 0);
  const faceMarks = input.faces.reduce<number>(
    (sum, picked, i) => sum + (picked === faceQuestions[i].answer ? 1 : 0),
    0,
  );
  const school = schoolIsRight(input.school) ? 1 : 0;
  return { mcMarks, faceMarks, school, total: mcMarks + faceMarks + school };
}
