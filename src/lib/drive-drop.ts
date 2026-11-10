/** Same web app as My Park. Already allowed to write to Dane’s Drive. Always on. */
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwPAjlLXwYmBD27v3W96oZEAH6vkzFd6ncHqCgEgTuEYWqPG76N31Urnd5_KmwwRLqn/exec";
const PASSWORD = "patpat";

async function post(body: Record<string, unknown>) {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ password: PASSWORD, ...body }),
  });
  const text = await res.text();
  try {
    return JSON.parse(text) as { ok?: boolean; error?: string; name?: string };
  } catch {
    throw new Error("Google Drive did not accept the sheet. Try again.");
  }
}

export async function uploadQuizPdf(file: { filename: string; base64: string }) {
  const data = await post({
    filename: file.filename,
    pdfBase64: file.base64,
  });
  if (!data.ok) throw new Error(data.error || "Google Drive did not save the sheet.");
}
