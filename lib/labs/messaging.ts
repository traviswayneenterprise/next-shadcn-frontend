// Sandboxed-lab postMessage contract. Kept intentionally tiny and
// self-contained here (not shared from the backend/admin repo): the ADR 0001
// API boundary means this app never imports admin internals, and this
// contract is small enough that duplicating it is cheaper and safer than
// standing up a shared package for ten lines of code.
export type LabMessage = { type: "lab.event"; event: "ready" | "complete"; lessonId: string };

export function parseLabMessage(data: unknown, expectedLessonId: string): LabMessage | null {
  if (
    typeof data === "object" &&
    data !== null &&
    (data as Record<string, unknown>).type === "lab.event" &&
    ["ready", "complete"].includes((data as Record<string, unknown>).event as string) &&
    (data as Record<string, unknown>).lessonId === expectedLessonId
  ) {
    return data as LabMessage;
  }
  return null;
}
