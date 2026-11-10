import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Eraser, Undo2 } from "lucide-react";
import { brownColours, posterColours, skinColours, type DrawTool, type Shape } from "@/data/lovely-quiz";
import {
  builtSentence,
  chibiBody,
  expressions,
  feelings,
  sayScenes,
  type ExprId,
  type SayId,
} from "@/data/officer-quiz";
import { assetUrl } from "@/lib/asset-url";
import { downloadOfficerSheet } from "@/lib/officer-pdf";
import { uploadQuizPdf } from "@/lib/drive-drop";
import { blobBase64 } from "@/lib/quiz-paper";
import { paintShapes } from "@/lib/poster";
import { renderWanted } from "@/lib/wanted-poster";

type Phase = "details" | "title" | "quiz" | "done";
type Who = "" | "boy" | "girl";

const sayOrder: SayId[] = ["run", "phone", "bus"];
const emptySay = (): Record<string, string | null> => ({});

const FACE = 800;

export function OfficerQuiz({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<Phase>("details");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [q, setQ] = useState(0);
  const [say, setSay] = useState<Record<SayId, Record<string, string | null>>>({
    run: emptySay(),
    phone: emptySay(),
    bus: emptySay(),
  });
  const [faces, setFaces] = useState<Array<ExprId | null>>([null, null, null, null]);
  const [crime, setCrime] = useState("");
  const [reward, setReward] = useState("");
  const [who, setWho] = useState<Who>("");
  const [photo, setPhoto] = useState("");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [colour, setColour] = useState(skinColours[2]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const [example, setExample] = useState(false);
  const sending = useRef(false);

  async function saveSheet() {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setNote("");
    try {
      const posterImage = await renderWanted({ photo, shapes, crime, reward, who });
      const file = await downloadOfficerSheet({
        name: name.trim(),
        className: className.trim(),
        say,
        faces,
        crime,
        reward,
        who,
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
            className="mt-4 min-h-12 bg-magenta px-4 text-xl disabled:opacity-40"
          >
            Next
          </button>
        </section>
      ) : null}

      {phase === "title" ? (
        <section className="border-4 border-neon bg-magenta px-5 py-8 text-center text-ink">
          <p className="text-xl">
            {name.trim()} · {className.trim()}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none sm:text-5xl">Officer Robo - Quiz!</h2>
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
              <SayBlock
                id={sayOrder[q]}
                picks={say[sayOrder[q]]}
                onPick={(key, value) =>
                  setSay((prev) => ({ ...prev, [sayOrder[q]]: { ...prev[sayOrder[q]], [key]: value } }))
                }
              />
            ) : null}
            {q >= 3 && q < 7 ? (
              <FeelingBlock
                index={q - 3}
                picked={faces[q - 3]}
                onPick={(id) => setFaces((prev) => prev.map((item, i) => (i === q - 3 ? id : item)))}
              />
            ) : null}
            {q === 7 ? (
              <WantedBlock
                crime={crime}
                reward={reward}
                who={who}
                photo={photo}
                shapes={shapes}
                colour={colour}
                onCrime={setCrime}
                onReward={setReward}
                onWho={setWho}
                onPhoto={setPhoto}
                onShapes={setShapes}
                onColour={setColour}
                onExample={() => setExample(true)}
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
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-1 bg-magenta px-3 text-lg text-ink"
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
            <button type="button" onClick={() => void saveSheet()} className="mt-4 min-h-12 bg-magenta px-4 text-xl text-ink">
              Try again
            </button>
          ) : null}
        </section>
      ) : null}

      {example ? (
        <button
          type="button"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-purple-deep/80 p-4"
          onClick={() => setExample(false)}
          aria-label="Close the example poster"
        >
          <img src={assetUrl("quiz/wanted-example.jpg")} alt="Example wanted poster" className="max-h-[90svh] max-w-full object-contain" />
        </button>
      ) : null}
    </div>
  );
}

function SayBlock({
  id,
  picks,
  onPick,
}: {
  id: SayId;
  picks: Record<string, string | null>;
  onPick: (key: string, value: string) => void;
}) {
  const scene = sayScenes[id];
  return (
    <div>
      <h3 className="text-2xl leading-snug">What is Officer Robo saying?</h3>
      <img src={scene.image} alt={scene.alt} className="mt-3 max-h-56 w-full border-4 border-purple object-contain" />
      <p className="mt-3 text-2xl leading-snug">{builtSentence(id, picks)}</p>
      {scene.groups.map((group) => (
        <div key={group.key} className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={group.key}>
          {group.options.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={picks[group.key] === option}
              onClick={() => onPick(group.key, option)}
              className={`min-h-11 px-3 text-xl ${picks[group.key] === option ? "bg-neon" : "bg-orange"}`}
            >
              {option}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Speech({ line, speaker }: { line: string; speaker: "chibi" | "other" }) {
  const mine = speaker === "chibi";
  return (
    <div className={mine ? "relative mx-auto mt-3 mb-3 max-w-xl" : "relative mt-3 mb-3 mr-16 max-w-lg"}>
      <p
        className={`border-4 border-purple px-4 py-3 text-2xl leading-snug text-ink ${
          mine ? "rounded-[1.75rem] bg-neon" : "rounded-[1.75rem] rounded-bl-md bg-cream"
        }`}
      >
        {line}
      </p>
      {mine ? (
        <span aria-hidden className="absolute -bottom-3 left-1/2 size-5 -translate-x-1/2 rotate-45 border-r-4 border-b-4 border-purple bg-neon" />
      ) : (
        <span aria-hidden className="absolute bottom-5 -left-3 size-5 rotate-45 border-b-4 border-l-4 border-purple bg-cream" />
      )}
    </div>
  );
}

function FeelingBlock({
  index,
  picked,
  onPick,
}: {
  index: number;
  picked: ExprId | null;
  onPick: (id: ExprId) => void;
}) {
  const question = feelings[index];
  const chosen = expressions.find((face) => face.id === picked);

  return (
    <div>
      <h3 className="text-2xl leading-snug">How do they feel? Match the right face!</h3>
      <Speech line={question.line} speaker={question.from} />
      <div className="mt-1 flex items-start justify-center gap-3">
        <div className="relative w-[min(62%,320px)] shrink-0">
          <img src={chibiBody} alt="The pupil" className="w-full" />
          {chosen ? (
            <img
              src={chosen.face}
              alt=""
              className="pointer-events-none absolute left-[31.8%] top-[37.4%] w-[36.5%]"
            />
          ) : null}
        </div>
        <div className="grid w-[4.75rem] shrink-0 grid-cols-1 gap-2" role="radiogroup" aria-label="Faces">
          {expressions.map((face) => (
            <button
              key={face.id}
              type="button"
              role="radio"
              aria-checked={picked === face.id}
              aria-label={face.label}
              onClick={() => onPick(face.id)}
              className={`border-4 bg-cream p-0.5 ${picked === face.id ? "border-neon" : "border-purple"}`}
            >
              <img src={face.face} alt="" className="h-12 w-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WantedBlock(props: {
  crime: string;
  reward: string;
  who: Who;
  photo: string;
  shapes: Shape[];
  colour: string;
  onCrime: (value: string) => void;
  onReward: (value: string) => void;
  onWho: (value: Who) => void;
  onPhoto: (url: string) => void;
  onShapes: (shapes: Shape[]) => void;
  onColour: (colour: string) => void;
  onExample: () => void;
}) {
  const [tool, setTool] = useState<DrawTool>("brush");
  const rows = [
    { label: "Colours", colours: posterColours },
    { label: "Skin", colours: skinColours },
    { label: "Brown", colours: brownColours },
  ];
  const crime = props.crime.trim() || "_______________";
  const reward = props.reward.trim() || "_______";
  const who = props.who || "boy / girl";

  return (
    <div>
      <h3 className="text-2xl leading-snug">Make a wanted poster! What did they do wrong?</h3>
      <p className="mt-2 text-xl leading-snug">If you copy the examples you will get ZERO marks.</p>
      <button type="button" onClick={props.onExample} className="mt-3 flex items-center gap-3 text-left">
        <img src={assetUrl("quiz/wanted-example.jpg")} alt="" className="h-24 w-16 object-cover" />
        <span className="text-xl underline">See an example</span>
      </button>
      <div className="mt-3 border-8 border-[#2a1a0c] bg-[#f3e2c4] p-3 text-center text-[#1a1008]">
        <p className="font-wanted text-5xl leading-none">WANTED!</p>
        <FaceCanvas photo={props.photo} shapes={props.shapes} colour={props.colour} tool={tool} onShapes={props.onShapes} />
        <p className="mt-3 font-penmanship text-3xl leading-tight text-[#111111]">WANTED FOR {crime.toUpperCase()}</p>
        <p className="font-penmanship text-3xl leading-tight text-[#111111]">${reward.toUpperCase()} REWARD</p>
        <p className="mt-2 font-penmanship text-2xl leading-tight text-[#111111]">
          IF YOU SEE THIS {who.toUpperCase()}, PLEASE TELL THE POLICE!
        </p>
      </div>
      <label className="mt-3 block text-lg">
        Wanted for
        <input
          value={props.crime}
          onChange={(event) => props.onCrime(event.target.value)}
          placeholder="littering in the library"
          className="mt-1 min-h-12 w-full border-2 border-purple px-3 text-2xl"
        />
      </label>
      <label className="mt-3 block text-lg">
        $ reward
        <input
          value={props.reward}
          onChange={(event) => props.onReward(event.target.value)}
          placeholder="5000"
          inputMode="numeric"
          className="mt-1 min-h-12 w-full border-2 border-purple px-3 text-2xl"
        />
      </label>
      <div className="mt-3 flex gap-2">
        {(["boy", "girl"] as const).map((person) => (
          <button
            key={person}
            type="button"
            onClick={() => props.onWho(person)}
            className={`min-h-12 flex-1 text-xl ${props.who === person ? "bg-neon" : "bg-orange"}`}
          >
            {person}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => setTool("brush")} className={`min-h-12 flex-1 text-xl ${tool === "brush" ? "bg-neon" : "bg-orange"}`}>
          Brush
        </button>
        <button type="button" onClick={() => setTool("pen")} className={`min-h-12 flex-1 text-xl ${tool === "pen" ? "bg-neon" : "bg-orange"}`}>
          Pen
        </button>
        <RoboCamera
          onShot={(url) => {
            props.onPhoto(url);
          }}
        />
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
                onClick={() => props.onColour(swatch)}
                className={`size-11 border-4 ${props.colour === swatch ? "border-ink" : "border-cream"}`}
                style={{ background: swatch }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => props.onShapes(props.shapes.slice(0, -1))}
          className="inline-flex min-h-11 items-center gap-1 border-2 border-purple px-3 text-lg"
        >
          <Undo2 className="size-4" aria-hidden />
          Undo
        </button>
        <button
          type="button"
          onClick={() => props.onShapes([])}
          className="inline-flex min-h-11 items-center gap-1 border-2 border-purple px-3 text-lg"
        >
          <Eraser className="size-4" aria-hidden />
          Clear drawing
        </button>
      </div>
      <p className="mt-2 text-lg">
        {tool === "brush" ? "Brush: draw a shape. Let go, and it fills." : "Pen: draw a line. It does not fill."} Draw a
        face, or use the camera.
      </p>
    </div>
  );
}

function FaceCanvas({
  photo,
  shapes,
  colour,
  tool,
  onShapes,
}: {
  photo: string;
  shapes: Shape[];
  colour: string;
  tool: DrawTool;
  onShapes: (shapes: Shape[]) => void;
}) {
  const ink = useRef<HTMLCanvasElement>(null);
  const live = useRef<HTMLCanvasElement>(null);
  const draft = useRef<Shape["pts"]>([]);

  useEffect(() => {
    const canvas = ink.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, FACE, FACE);
    paintShapes(ctx, shapes, FACE, FACE);
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
    ctx.clearRect(0, 0, FACE, FACE);
    const pts = draft.current;
    if (pts.length < 2) return;
    ctx.beginPath();
    pts.forEach((pt, i) => {
      const x = pt.x * FACE;
      const y = pt.y * FACE;
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
    <div className="relative mx-auto mt-3 aspect-square w-full max-w-sm overflow-hidden border-4 border-[#1a1008] bg-[#f7edd8]">
      {photo ? <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <canvas ref={ink} width={FACE} height={FACE} className="absolute inset-0 h-full w-full" />
      <canvas
        ref={live}
        width={FACE}
        height={FACE}
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
          live.current?.getContext("2d")?.clearRect(0, 0, FACE, FACE);
          if (pts.length < (tool === "pen" ? 2 : 8)) return;
          onShapes([...shapes, { pts, color: colour, tool }]);
        }}
      />
    </div>
  );
}

function RoboCamera({ onShot }: { onShot: (url: string) => void }) {
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
      <button type="button" onClick={() => setOpen(true)} className="min-h-12 bg-purple px-3 text-xl text-cream">
        Camera
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
