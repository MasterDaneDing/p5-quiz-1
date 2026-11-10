import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, RotateCcw } from "lucide-react";
import { stories, type StoryId } from "@/data/stories";
import { LovelyQuiz } from "@/components/lovely-quiz";
import { OfficerQuiz } from "@/components/officer-quiz";
import { loadQuizFonts } from "@/lib/quiz-fonts";

const order: StoryId[] = ["lovely", "robo"];

type Pages = Record<StoryId, number>;

const emptyPages: Pages = { lovely: 0, robo: 0 };

export function StoryQuiz() {
  const [screen, setScreen] = useState<StoryId | "home">("home");
  const [runs, setRuns] = useState<Record<StoryId, number>>({ lovely: 0, robo: 0 });
  const [finished, setFinished] = useState<Record<StoryId, boolean>>({ lovely: false, robo: false });
  const [pages, setPages] = useState<Pages>(emptyPages);
  const [storyId, setStoryId] = useState<StoryId | null>(null);
  const [minimized, setMinimized] = useState(false);

  const quiz = screen === "home" ? null : stories[screen];
  const story = storyId ? stories[storyId] : null;
  const page = storyId ? pages[storyId] : 0;
  const current = story?.pages[page];
  const expanded = story !== null && !minimized;

  useEffect(() => {
    void loadQuizFonts();
  }, []);

  function openStory(id: StoryId) {
    setStoryId(id);
    setMinimized(false);
  }

  function restartStory(id: StoryId) {
    setPages((prev) => ({ ...prev, [id]: 0 }));
    setStoryId(id);
    setMinimized(false);
  }

  function jump(id: StoryId, index: number) {
    const last = stories[id].pages.length - 1;
    setPages((prev) => ({ ...prev, [id]: Math.max(0, Math.min(last, index)) }));
  }

  function step(id: StoryId, delta: number) {
    setPages((prev) => {
      const last = stories[id].pages.length - 1;
      return { ...prev, [id]: Math.max(0, Math.min(last, prev[id] + delta)) };
    });
  }

  return (
    <div className="min-h-screen text-cream">
      <main className={`mx-auto min-h-screen max-w-3xl flex-col gap-4 px-4 py-6 pb-28 ${screen === "home" ? "flex" : "hidden"}`}>
          <header className="bg-orange px-5 py-4 text-ink">
            <p className="text-lg">P5 English</p>
            <h1 className="font-display text-4xl leading-none">Two quizzes</h1>
            <p className="mt-2 text-xl leading-snug">
              The stories sit along the bottom. Open one, minimise it, or start it again from the first page.
            </p>
          </header>
          {order.map((id) => {
            const item = stories[id];
            const isLovely = id === "lovely";
            return (
              <button
                key={id}
                type="button"
                onClick={() => setScreen(id)}
                className={`relative flex min-h-36 flex-col justify-center px-5 py-6 text-left ${
                  isLovely ? "bg-orange text-ink" : "bg-magenta text-ink"
                }`}
              >
                <p className="text-lg">{isLovely ? "Open day" : "Follow the rules"}</p>
                <p className="font-display text-3xl leading-tight sm:text-4xl">{item.quizTitle}</p>
                <span className="mt-4 inline-block bg-neon px-3 py-1 text-lg text-ink">
                  {finished[id] ? "Complete" : "10 marks"}
                </span>
              </button>
            );
          })}
          <DriveSetup
            onNewPupil={() => {
              setFinished({ lovely: false, robo: false });
              setRuns((prev) => ({ lovely: prev.lovely + 1, robo: prev.robo + 1 }));
              setScreen("home");
            }}
          />
      </main>
      <div className={`mx-auto min-h-screen max-w-3xl flex-col pb-28 ${screen === "home" ? "hidden" : "flex"}`}>
        <header className={`px-4 py-4 ${screen === "lovely" ? "bg-orange text-ink" : "bg-magenta text-ink"}`}>
            <button
              type="button"
              onClick={() => setScreen("home")}
              className="min-h-11 text-lg underline decoration-purple underline-offset-4"
            >
              Both quizzes
            </button>
            <div className="mt-2">
              <h1 className="font-display text-3xl leading-none sm:text-4xl">{quiz?.quizTitle}</h1>
            </div>
          </header>

          <div className={screen === "lovely" ? "" : "hidden"}>
            <LovelyQuiz key={runs.lovely} onComplete={() => setFinished((prev) => ({ ...prev, lovely: true }))} />
          </div>
          <div className={screen === "robo" ? "" : "hidden"}>
            <OfficerQuiz key={runs.robo} onComplete={() => setFinished((prev) => ({ ...prev, robo: true }))} />
          </div>
      </div>

      {expanded && story && current ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-purple-deep/55"
          aria-label="Minimise story"
          onClick={() => setMinimized(true)}
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col">
        {expanded && story && current ? (
          <section
            className="mx-3 mb-2 flex max-h-[calc(100svh-7.5rem)] min-h-0 flex-1 flex-col overflow-hidden border-4 border-neon bg-cream text-ink shadow-xl md:mx-8"
            aria-label={story.title}
          >
            <div className={`flex items-center gap-2 px-3 py-2 ${storyId === "lovely" ? "bg-orange" : "bg-magenta"}`}>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl leading-none">{story.title}</h2>
                <p className="text-lg leading-tight">
                  {story.kicker} · page {page + 1} of {story.pages.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => storyId && restartStory(storyId)}
                className="inline-flex min-h-11 items-center gap-1 bg-neon px-3 text-lg text-ink"
              >
                <RotateCcw className="size-4" aria-hidden />
                Restart
              </button>
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="inline-flex min-h-11 items-center gap-1 bg-purple px-3 text-lg text-cream"
              >
                <Minus className="size-4" aria-hidden />
                Minimise
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
              <img
                src={current.image}
                alt={current.caption || story.title}
                className="mx-auto max-h-[42vh] w-full object-contain"
              />
              {current.caption ? (
                <p className="text-2xl leading-snug whitespace-pre-line">{current.caption}</p>
              ) : (
                <p className="text-lg text-purple">Picture only. Turn the page for the finished sentence.</p>
              )}
            </div>

            <div className="flex items-center gap-2 border-t-4 border-purple bg-cream px-3 py-2">
              <button
                type="button"
                onClick={() => storyId && step(storyId, -1)}
                disabled={page === 0}
                className="inline-flex min-h-12 items-center gap-1 bg-purple px-3 text-lg text-cream disabled:opacity-40"
              >
                <ChevronLeft className="size-5" aria-hidden />
                Back
              </button>
              <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
                {story.pages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => storyId && jump(storyId, i)}
                    aria-label={`Page ${i + 1}`}
                    aria-current={i === page}
                    className={`h-11 min-w-11 shrink-0 text-lg tabular-nums ${
                      i === page ? "bg-neon text-ink" : "bg-orange text-ink"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => storyId && step(storyId, 1)}
                disabled={page === story.pages.length - 1}
                className="inline-flex min-h-12 items-center gap-1 bg-magenta px-3 text-lg text-ink disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </section>
        ) : null}

        <div className="border-t-4 border-neon bg-purple">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-3 py-2">
            {order.map((id) => {
              const active = storyId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => (active && !minimized ? setMinimized(true) : openStory(id))}
                  className={`min-h-12 px-3 text-left text-lg ${
                    active ? "bg-neon text-ink" : id === "lovely" ? "bg-orange text-ink" : "bg-magenta text-ink"
                  }`}
                >
                  {stories[id].title}
                  {active ? ` · p.${pages[id] + 1}` : ""}
                </button>
              );
            })}
            {storyId ? (
              <button
                type="button"
                onClick={() => restartStory(storyId)}
                className="inline-flex min-h-12 items-center gap-1 border border-cream px-3 text-lg text-cream"
              >
                <RotateCcw className="size-4" aria-hidden />
                Restart
              </button>
            ) : (
              <p className="text-lg">Pop up a story</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DriveSetup({ onNewPupil }: { onNewPupil: () => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="self-start text-base text-cream/80 underline">
        Teacher
      </button>
    );
  }

  return (
    <section className="border-4 border-purple bg-cream p-5 text-ink">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl leading-none">Teacher</h2>
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 bg-purple px-3 text-lg text-cream">
          Minimise
        </button>
      </div>
      <p className="mt-2 text-lg leading-snug">
        Finished sheets go straight to your Google Drive, in My Park Worksheets. Nothing is saved on the iPad.
      </p>
      <button type="button" onClick={onNewPupil} className="mt-3 min-h-12 border-2 border-purple px-4 text-xl">
        New pupil
      </button>
    </section>
  );
}
