// The wizard guide character: combine a pose and an expression into one SVG string.
// Parts come from VectorCraft (wizard.vectorcraft → `just wizard-export` → parts.generated.ts).
import { FACE_PARTS, POSE_PARTS } from "./parts.generated.ts";

export type Pose = "idle" | "tip" | "warn" | "think" | "cheer" | "cast" | "facepalm" | "sip" | "read" | "crystal";
export type Expression = "neutral" | "happy" | "worried" | "smug" | "surprised" | "deadpan" | "eyeroll";

export const POSES: Pose[] = ["idle", "tip", "warn", "think", "cheer", "cast", "facepalm", "sip", "read", "crystal"];
export const EXPRESSIONS: Expression[] = ["neutral", "happy", "worried", "smug", "surprised", "deadpan", "eyeroll"];

const EYE_LINE = 212; // y of the eyes in the 400x500 artboard (draw.py: EY)
const GREEN = "#3fb950";
const RED = "#ff4d4d";

export interface WizardOptions {
  pose: Pose;
  expression?: Expression;
  /** 0 = eyes open, 1 = closed */
  blink?: number;
  /** false hides the blinking cursor on the staff */
  cursorOn?: boolean;
  /** the rubber duck familiar on his shoulder (default true) */
  duck?: boolean;
  /** what the crystal ball shows in the `crystal` pose (default "ok": a green CI check) */
  ball?: "ok" | "fail";
  /** extra SVG transforms per part, for animation: { duck: "translate(0 -4)", body: "…" } */
  transforms?: Record<string, string>;
  /** accessible name; without it the image is decorative (aria-hidden) */
  title?: string;
}

function check<T extends string>(kind: string, value: string, valid: readonly T[]): T {
  if (!(valid as readonly string[]).includes(value)) {
    throw new Error(`Unknown ${kind} "${value}" (valid: ${valid.join(", ")})`);
  }
  return value as T;
}

function closeOf(markup: string, open: number): number {
  // index just past the </g> that closes the <g …> starting at `open`
  let depth = 0;
  const re = /<g\b[^>]*?(\/?)>|<\/g>/g;
  re.lastIndex = open;
  for (let m = re.exec(markup); m; m = re.exec(markup)) {
    if (m[0] === "</g>") depth--;
    else if (!m[1]) depth++;
    if (depth === 0) return re.lastIndex;
  }
  throw new Error("unbalanced <g> in wizard parts");
}

function removeGroup(markup: string, part: string): string {
  const at = markup.indexOf(`id="${part}"`);
  if (at < 0) return markup;
  const open = markup.lastIndexOf("<g", at);
  return markup.slice(0, open) + markup.slice(closeOf(markup, open));
}

export function wizardSvg(o: WizardOptions): string {
  const pose = check("pose", o.pose, POSES);
  const expression = check("expression", o.expression ?? "neutral", EXPRESSIONS);
  const blink = Math.min(1, Math.max(0, o.blink ?? 0));

  let face = FACE_PARTS[expression];
  if (pose !== "think" && pose !== "cast") face = removeGroup(face, "glint");
  if (blink > 0) {
    const s = Math.max(0.05, 1 - blink);
    face = face.replace('id="eyes"', `id="eyes" transform="translate(0 ${EYE_LINE}) scale(1 ${s}) translate(0 -${EYE_LINE})"`);
  }

  let body = POSE_PARTS[pose];
  if (o.duck === false) body = removeGroup(body, "duck");
  body = removeGroup(body, (o.ball ?? "ok") === "ok" ? "ball-fail" : "ball-ok");
  // the face goes right after the head circle, so nose, beard and hat draw over the glasses
  const head = body.indexOf('id="head"');
  const afterCircle = body.indexOf("/>", head) + 2;
  body = body.slice(0, afterCircle) + face + body.slice(afterCircle);

  const cursorAt = body.indexOf('id="staff-cursor"');
  if (cursorAt >= 0) {
    const open = body.lastIndexOf("<g", cursorAt);
    const close = closeOf(body, open);
    let cursor = body.slice(open, close);
    if (pose === "warn") cursor = cursor.replaceAll(GREEN, RED);
    if (o.cursorOn === false) cursor = cursor.replace('id="staff-cursor"', 'id="staff-cursor" opacity="0"');
    body = body.slice(0, open) + cursor + body.slice(close);
  }

  // ids become data-part so several wizards can share one page
  body = body.replaceAll(' id="', ' data-part="');
  for (const [part, tf] of Object.entries(o.transforms ?? {})) {
    const at = body.indexOf(`data-part="${part}"`);
    if (at < 0) throw new Error(`Unknown part "${part}" in transforms`);
    const tag = body.slice(at, body.indexOf(">", at));
    body = tag.includes(' transform="')
      ? body.slice(0, at) + tag.replace(' transform="', ` transform="${tf} `) + body.slice(at + tag.length)
      : body.slice(0, at) + `${tag} transform="${tf}"` + body.slice(at + tag.length);
  }
  const a11y = o.title
    ? `role="img" aria-label="${o.title.replaceAll('"', "&quot;")}"><title>${o.title.replaceAll("<", "&lt;")}</title>`
    : `aria-hidden="true">`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" ${a11y}${body}</svg>`;
}
