import type { Shape } from "@/data/lovely-quiz";
import { assetUrl } from "@/lib/asset-url";

export type { Shape };

export const chibiBody = assetUrl("/quiz/chibi-body.jpg");

export const expressions = [
  { id: "sad", src: assetUrl("/quiz/chibi-sad.jpg"), face: assetUrl("/quiz/expr-sad.png"), label: "Sad face" },
  { id: "angry", src: assetUrl("/quiz/chibi-angry.jpg"), face: assetUrl("/quiz/expr-angry.png"), label: "Angry face" },
  { id: "side", src: assetUrl("/quiz/chibi-side.jpg"), face: assetUrl("/quiz/expr-side.png"), label: "Unimpressed face" },
  { id: "cry", src: assetUrl("/quiz/chibi-cry.jpg"), face: assetUrl("/quiz/expr-cry.png"), label: "Crying face" },
  { id: "happy", src: assetUrl("/quiz/chibi-happy.jpg"), face: assetUrl("/quiz/expr-happy.png"), label: "Happy face" },
  { id: "sleepy", src: assetUrl("/quiz/chibi-sleepy.jpg"), face: assetUrl("/quiz/expr-sleepy.png"), label: "Sleepy face" },
] as const;

export type ExprId = (typeof expressions)[number]["id"];

export type SayId = "run" | "phone" | "bus";

export type Feeling = {
  id: string;
  line: string;
  from: "chibi" | "other";
  answers: ExprId[];
};

export const feelings: Feeling[] = [
  {
    id: "fine",
    line: "You must pay $500 for littering on the MTR!",
    from: "other",
    answers: ["sad", "cry"],
  },
  {
    id: "hey",
    line: "Hey! You mustn't run in the classroom!",
    from: "chibi",
    answers: ["angry"],
  },
  {
    id: "thanks",
    line: "Thank you so much, Officer Robo!",
    from: "chibi",
    answers: ["happy"],
  },
  {
    id: "sleep",
    line: "We mustn't sleep in the classroom!",
    from: "other",
    answers: ["sleepy"],
  },
];

export function sentenceRight(id: SayId, picks: Record<string, string | null>) {
  if (id === "run") return picks.modal === "shouldn't" && picks.verb === "run" && picks.place === "classroom";
  if (id === "phone") {
    const soft = picks.modal === "should" && picks.verb === "speak" && picks.manner === "softly";
    const loud = picks.modal === "shouldn't" && picks.verb === "speak" && picks.manner === "loudly";
    return soft || loud;
  }
  return picks.modal === "should not" && picks.verb === "litter";
}

export function feelingRight(index: number, picked: ExprId | null) {
  return picked !== null && feelings[index].answers.includes(picked);
}

export function objectiveScore(input: {
  say: Record<SayId, Record<string, string | null>>;
  faces: Array<ExprId | null>;
}) {
  const sayMarks = (["run", "phone", "bus"] as SayId[]).reduce(
    (sum, id) => sum + (sentenceRight(id, input.say[id]) ? 1 : 0),
    0,
  );
  const faceMarks = input.faces.reduce((sum, picked, index) => sum + (feelingRight(index, picked) ? 1 : 0), 0);
  return { sayMarks, faceMarks, total: sayMarks + faceMarks };
}

export function builtSentence(id: SayId, picks: Record<string, string | null>) {
  const word = (key: string) => picks[key] || "_____";
  if (id === "run") return `We ${word("modal")} ${word("verb")} in the ${word("place")}!`;
  if (id === "phone") return `We ${word("modal")} ${word("verb")} ${word("manner")} on our mobile phones on the MTR!`;
  return `We ${word("modal")} ${word("verb")} on the bus!`;
}

export const sayScenes: Record<SayId, { image: string; alt: string; groups: { key: string; options: string[] }[] }> = {
  run: {
    image: assetUrl("/quiz/robo-run.jpg"),
    alt: "A boy running between desks while Officer Robo points",
    groups: [
      { key: "modal", options: ["should", "shouldn't"] },
      { key: "verb", options: ["sing", "shout", "dance", "run"] },
      { key: "place", options: ["toilet", "library", "classroom", "playground"] },
    ],
  },
  phone: {
    image: assetUrl("/quiz/robo-phone.jpg"),
    alt: "A man shouting on a phone on the MTR while Officer Robo points",
    groups: [
      { key: "modal", options: ["should", "shouldn't"] },
      { key: "verb", options: ["speak", "sing", "cry"] },
      { key: "manner", options: ["loudly", "softly", "funnily", "happily"] },
    ],
  },
  bus: {
    image: assetUrl("/quiz/robo-litter.jpg"),
    alt: "A boy standing by a dropped can on a bus next to Officer Robo",
    groups: [
      { key: "modal", options: ["should", "should not"] },
      { key: "verb", options: ["stand", "sing", "eat", "litter"] },
    ],
  },
};
