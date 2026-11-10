import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Eraser, Undo2 } from "lucide-react";
import {
  backgrounds,
  brownColours,
  faceQuestions,
  faces,
  mcQuestions,
  modals,
  posterColours,
  skinColours,
  type BgId,
  type DrawTool,
  type Face,
  type Modal,
  type Shape,
} from "@/data/lovely-quiz";
import { downloadLovelySheet } from "@/lib/lovely-pdf";
import { uploadQuizPdf } from "@/lib/drive-drop";
import { blobBase64 } from "@/lib/quiz-paper";
import { paintShapes, POSTER_H, POSTER_W, renderPoster } from "@/lib/poster";

type Phase = "details" | "title" | "quiz" | "done";

const emptySchool: [string, string, string] = ["", "", ""];

export function LovelyQuiz({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<Phase>("details");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [q, setQ] = useState(0);
  const [mc, setMc] = useState<Array<number | null>>([null, null, null]);
  const [facePicks, setFacePicks] = useState<Array<Face | null>>([null, null, null]);
  const [modal, setModal] = useState<Modal>("We should");
  const [posterText, setPosterText] = useState("");
  const [bgId, setBgId] = useState<BgId>("classroom");
  const [photo, setPhoto] = useState("");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [colour, setColour] = useState(posterColours[0]);
  const [school, setSchool] = useState<[string, string, string]>(emptySchool);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const sending = useRef(false);

  const posterLine = `${modal} ${posterText}`.trim();
  const background =
    bgId === "photo" ? photo : (backgrounds.find((item) => item.id === bgId)?.src ?? backgrounds[0].src);

  async function saveSheet() {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setNote("");
    try {
      const posterImage = await renderPoster({ background, shapes, line: posterLine });
      const file = await downloadLovelySheet({
        name: name.trim(),
        className: className.trim(),
        mc,
        faces: facePicks,
        modal,
        posterText: posterText.trim(),
        school,
        shapes,
        posterImage,
      });
      await uploadQuizPdf({ filename: file.filename, base64: await blobBase64(file.blob) });
      setSent(true);
      setNote("Sent to the teacher.");
      onComplete?.();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not send the sheet. Try again.");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-5 text-ink">
      {phase === "details" ? (
        <section className="border-4 border-neon bg-cream p-5">
          <h2 className="font-display text-3xl leading-none">Before you start</h2>
          <label className="mt-4 block text-xl">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 min-h-12 w-full border-2 border-purple bg-cream px-3 text-2xl"
              autoComplete="name"
            />
          </label>
          <label className="mt-3 block text-xl">
            Class
            <input
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              className="mt-1 min-h-12 w-full border-2 border-purple bg-cream px-3 text-2xl"
              autoComplete="off"
            />
          </label>
          <button
            type="button"
            disabled={!name.trim() || !className.trim()}
            onClick={() => setPhase("title")}
            className="mt-4 min-h-12 bg-orange px-4 text-xl disabled:opacity-40"
          >
            Next
          </button>
        </section>
      ) : null}

      {phase === "title" ? (
        <section className="border-4 border-neon bg-orange px-5 py-8 text-center text-ink">
          <p className="text-xl">
            {name.trim()} · {className.trim()}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">Lovely School - Quiz!</h2>
          <p className="mt-4 text-xl leading-snug">Read the story if you need it. Then start.</p>
          <button type="button" onClick={() => setPhase("quiz")} className="mt-6 min-h-14 bg-purple px-6 text-2xl text-cream">
            Start
          </button>
        </section>
      ) : null}

      {phase === "quiz" ? (
        <>
          <p className="w-fit bg-purple px-3 py-1 text-lg text-cream">Question {q + 1} of 8</p>
          <section className="border-4 border-neon bg-cream p-4">
            {q < 3 ? (
              <McBlock
                index={q}
                picked={mc[q]}
                onPick={(choice) => setMc((prev) => prev.map((item, i) => (i === q ? choice : item)))}
              />
            ) : null}
            {q >= 3 && q < 6 ? (
              <FaceBlock
                index={q - 3}
                picked={facePicks[q - 3]}
                onPick={(face) => setFacePicks((prev) => prev.map((item, i) => (i === q - 3 ? face : item)))}
              />
            ) : null}
            {q === 6 ? (
              <PosterBlock
                modal={modal}
                text={posterText}
                bgId={bgId}
                background={background}
                shapes={shapes}
                colour={colour}
                line={posterLine}
                onModal={setModal}
                onText={setPosterText}
                onBg={setBgId}
                onPhoto={setPhoto}
                onShapes={setShapes}
                onColour={setColour}
              />
            ) : null}
            {q === 7 ? (
              <SchoolBlock
                school={school}
                onChange={(index, value) =>
                  setSchool((prev) => {
                    const next = [...prev] as [string, string, string];
                    next[index] = value;
                    return next;
                  })
                }
              />
            ) : null}
          </section>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (q === 0 ? setPhase("title") : setQ((n) => n - 1))}
              className="inline-flex min-h-12 items-center gap-1 bg-purple px-3 text-lg text-cream"
            >
              <ChevronLeft className="size-5" aria-hidden />
              Back
            </button>
            {q < 7 ? (
              <button
                type="button"
                onClick={() => setQ((n) => n + 1)}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-1 bg-orange px-3 text-lg text-ink"
              >
                Next
                <ChevronRight className="size-5" aria-hidden />
              </button>
            ) : (
              <button type="button" onClick={() => { setPhase("done"); void saveSheet(); }} className="min-h-12 flex-1 bg-neon px-3 text-lg text-ink">
                Finish
              </button>
            )}
          </div>
        </>
      ) : null}

      {phase === "done" ? (
        <section className="border-4 border-neon bg-cream p-5">
          <h2 className="font-display text-4xl leading-none">Complete</h2>
          <p className="mt-3 text-xl leading-snug">
            {busy ? "Sending the sheet to the teacher…" : note || "Sending the sheet to the teacher…"}
          </p>
          {!busy && !sent ? (
            <button type="button" onClick={() => void saveSheet()} className="mt-4 min-h-12 bg-orange px-4 text-xl text-ink">
              Try again
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function McBlock({
  index,
  picked,
  onPick,
}: {
  index: number;
  picked: number | null;
  onPick: (choice: number) => void;
}) {
  const question = mcQuestions[index];
  return (
    <div>
      <h3 className="text-2xl leading-snug">{question.prompt}</h3>
      {question.lead ? <p className="mt-2 text-xl">{question.lead}</p> : null}
      <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label={question.prompt}>
        {question.choices.map((choice, choiceIndex) => (
          <button
            key={choice}
            type="button"
            role="radio"
            aria-checked={picked === choiceIndex}
            onClick={() => onPick(choiceIndex)}
            className={`min-h-12 border-2 px-3 py-2 text-left text-xl ${
              picked === choiceIndex ? "border-purple bg-neon" : "border-purple bg-cream"
            }`}
          >
            <span className="mr-2">{String.fromCharCode(65 + choiceIndex)}</span>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

function FaceBlock({
  index,
  picked,
  onPick,
}: {
  index: number;
  picked: Face | null;
  onPick: (face: Face) => void;
}) {
  const question = faceQuestions[index];
  const startX = useRef(0);

  function swipe(endX: number) {
    if (Math.abs(endX - startX.current) < 36) return;
    onPick(endX < startX.current ? "angry" : "happy");
  }

  return (
    <div>
      <h3 className="text-2xl leading-snug">
        How does Principal Lovely feel when he hears what the students say? Select the right face!
      </h3>
      <div className="mt-3 flex items-center gap-3">
        <img src={question.child} alt={question.childAlt} className="h-28 w-24 object-contain" />
        <p className="text-2xl leading-snug">{question.line}</p>
      </div>
      <div
        className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => swipe(event.clientX)}
      >
        {(Object.keys(faces) as Face[]).map((face) => (
          <button
            key={face}
            type="button"
            onClick={() => onPick(face)}
            aria-pressed={picked === face}
            className={`border-4 bg-cream p-1 ${picked === face ? "border-neon" : "border-purple"}`}
          >
            <img src={faces[face].src} alt={faces[face].label} className="mx-auto h-64 w-full object-contain" />
          </button>
        ))}
      </div>
      <p className="mt-2 text-lg">Swipe across the faces, or tap one.</p>
    </div>
  );
}

function SchoolBlock({
  school,
  onChange,
}: {
  school: [string, string, string];
  onChange: (index: number, value: string) => void;
}) {
  const widths = ["w-24", "w-36", "w-36"];
  return (
    <div>
      <h3 className="text-2xl leading-snug">In the end of the story, which school does the boy go to?</h3>
      <div className="mt-4 flex flex-wrap items-end gap-2 text-2xl">
        {school.map((word, index) => (
          <input
            key={index}
            value={word}
            onChange={(event) => onChange(index, event.target.value)}
            aria-label={`Word ${index + 1}`}
            className={`${widths[index]} min-h-12 border-b-4 border-purple bg-transparent px-1`}
          />
        ))}
        <span>School.</span>
      </div>
    </div>
  );
}

function PosterBlock(props: {
  modal: Modal;
  text: string;
  bgId: BgId;
  background: string;
  shapes: Shape[];
  colour: string;
  line: string;
  onModal: (modal: Modal) => void;
  onText: (text: string) => void;
  onBg: (id: BgId) => void;
  onPhoto: (url: string) => void;
  onShapes: (shapes: Shape[]) => void;
  onColour: (colour: string) => void;
}) {
  return (
    <div>
      <h3 className="text-2xl leading-snug">
        Make a poster telling us about something we should do or should not do at school.
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {modals.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => props.onModal(item)}
            className={`min-h-11 px-3 text-lg ${props.modal === item ? "bg-neon" : "bg-orange"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-lg">
        Finish the rule
        <input
          value={props.text}
          onChange={(event) => props.onText(event.target.value)}
          placeholder="run in the classroom"
          className="mt-1 min-h-12 w-full border-2 border-purple px-3 text-2xl"
        />
      </label>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {backgrounds.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => props.onBg(item.id)}
            className={`w-24 shrink-0 border-4 ${props.bgId === item.id ? "border-neon" : "border-transparent"}`}
          >
            <img src={item.src} alt={item.label} className="h-16 w-full object-cover" />
            <span className="block text-center text-lg">{item.label}</span>
          </button>
        ))}
        <CameraShot
          active={props.bgId === "photo"}
          onShot={(url) => {
            props.onPhoto(url);
            props.onBg("photo");
          }}
        />
      </div>
      <DrawTools
        background={props.background}
        shapes={props.shapes}
        colour={props.colour}
        line={props.line}
        onShapes={props.onShapes}
        onColour={props.onColour}
      />
    </div>
  );
}

function DrawTools({
  background,
  shapes,
  colour,
  line,
  onShapes,
  onColour,
}: {
  background: string;
  shapes: Shape[];
  colour: string;
  line: string;
  onShapes: (shapes: Shape[]) => void;
  onColour: (colour: string) => void;
}) {
  const [tool, setTool] = useState<DrawTool>("brush");
  const rows = [
    { label: "Colours", colours: posterColours },
    { label: "Skin", colours: skinColours },
    { label: "Brown", colours: brownColours },
  ];

  return (
    <div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setTool("brush")}
          className={`min-h-12 flex-1 text-xl ${tool === "brush" ? "bg-neon" : "bg-orange"}`}
        >
          Brush
        </button>
        <button
          type="button"
          onClick={() => setTool("pen")}
          className={`min-h-12 flex-1 text-xl ${tool === "pen" ? "bg-neon" : "bg-orange"}`}
        >
          Pen
        </button>
      </div>
      {rows.map((row) => (
        <div key={row.label} className="mt-3">
          <p className="text-lg">{row.label}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {row.colours.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={`${row.label} colour`}
                onClick={() => onColour(swatch)}
                className={`size-11 border-4 ${colour === swatch ? "border-ink" : "border-cream"}`}
                style={{ background: swatch }}
              />
            ))}
          </div>
        </div>
      ))}
      <PosterCanvas background={background} shapes={shapes} colour={colour} tool={tool} line={line} onShapes={onShapes} />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onShapes(shapes.slice(0, -1))}
          className="inline-flex min-h-11 items-center gap-1 border-2 border-purple px-3 text-lg"
        >
          <Undo2 className="size-4" aria-hidden />
          Undo
        </button>
        <button
          type="button"
          onClick={() => onShapes([])}
          className="inline-flex min-h-11 items-center gap-1 border-2 border-purple px-3 text-lg"
        >
          <Eraser className="size-4" aria-hidden />
          Clear drawing
        </button>
      </div>
      <p className="mt-2 text-lg">
        {tool === "brush" ? "Brush: draw a shape. Let go, and it fills." : "Pen: draw a line. It does not fill."}
      </p>
    </div>
  );
}

function PosterCanvas({
  background,
  shapes,
  colour,
  tool,
  line,
  onShapes,
}: {
  background: string;
  shapes: Shape[];
  colour: string;
  tool: DrawTool;
  line: string;
  onShapes: (shapes: Shape[]) => void;
}) {
  const ink = useRef<HTMLCanvasElement>(null);
  const live = useRef<HTMLCanvasElement>(null);
  const draft = useRef<Shape["pts"]>([]);

  useEffect(() => {
    const canvas = ink.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, POSTER_W, POSTER_H);
    paintShapes(ctx, shapes, POSTER_W, POSTER_H);
  }, [shapes]);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }

  function drawLive() {
    const canvas = live.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, POSTER_W, POSTER_H);
    const pts = draft.current;
    if (pts.length < 2) return;
    ctx.beginPath();
    pts.forEach((pt, i) => {
      const x = pt.x * POSTER_W;
      const y = pt.y * POSTER_H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = tool === "pen" ? colour : "#1a1028";
    ctx.lineWidth = tool === "pen" ? 18 : 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  return (
    <div className="relative mt-3 aspect-[3/2] w-full overflow-hidden border-4 border-purple">
      {background ? (
        <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-purple" />
      )}
      <canvas ref={ink} width={POSTER_W} height={POSTER_H} className="absolute inset-0 h-full w-full" />
      <canvas
        ref={live}
        width={POSTER_W}
        height={POSTER_H}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          draft.current = [point(event)];
          drawLive();
        }}
        onPointerMove={(event) => {
          if (draft.current.length === 0) return;
          draft.current.push(point(event));
          drawLive();
        }}
        onPointerUp={() => {
          const pts = draft.current;
          draft.current = [];
          const ctx = live.current?.getContext("2d");
          ctx?.clearRect(0, 0, POSTER_W, POSTER_H);
          if (pts.length < (tool === "pen" ? 2 : 8)) return;
          onShapes([...shapes, { pts, color: colour, tool }]);
        }}
      />
      <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-cream/90 px-2 py-2 text-center font-poster text-3xl leading-none text-ink">
        {line || "Your rule"}
      </p>
    </div>
  );
}

function CameraShot({ active, onShot }: { active: boolean; onShot: (url: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [open, setOpen] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    void navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: { ideal: facing } } })
      .then(async (next) => {
        if (cancelled) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = next;
        streamRef.current = next;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = next;
        await video.play();
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("The iPad blocked the camera. Allow it, or choose a photo.");
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open, facing]);

  function close() {
    setOpen(false);
    setError("");
  }

  function snap() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const scale = Math.min(1, 1400 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onShot(canvas.toDataURL("image/jpeg", 0.86));
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className={`flex w-24 shrink-0 flex-col border-4 ${active ? "border-neon" : "border-purple"}`}
      >
        <span className="flex h-16 items-center justify-center bg-purple text-center text-lg text-cream">Camera</span>
        <span className="bg-cream text-center text-lg text-ink">Take photo</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] flex flex-col bg-ink">
          <video ref={videoRef} className="min-h-0 flex-1 bg-black object-contain" autoPlay playsInline muted />
          {error ? <p className="bg-cream px-4 py-3 text-xl text-ink">{error}</p> : null}
          <div className="flex flex-wrap gap-2 bg-purple p-3">
            <button type="button" onClick={snap} className="min-h-14 flex-1 bg-neon text-xl text-ink">
              Take photo
            </button>
            <button
              type="button"
              onClick={() => setFacing((side) => (side === "environment" ? "user" : "environment"))}
              className="min-h-14 bg-orange px-4 text-xl text-ink"
            >
              Flip
            </button>
            <label className="inline-flex min-h-14 cursor-pointer items-center bg-magenta px-4 text-xl text-ink">
              Choose photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void shrinkPhoto(file).then((url) => {
                    onShot(url);
                    close();
                  });
                }}
              />
            </label>
            <button type="button" onClick={close} className="min-h-14 border border-cream px-4 text-xl text-cream">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function shrinkPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("photo"));
    };
    img.src = url;
  });
}
