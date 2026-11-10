import { createFileRoute } from "@tanstack/react-router";
import { StoryQuiz } from "@/components/story-quiz";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <StoryQuiz />;
}
