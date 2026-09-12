import type { components } from "@/lib/api/generated/schema";
import { apiRequest } from "@/lib/api/client";

export type LearnTrack = components["schemas"]["LearnTrack"];
export type LearnLesson = components["schemas"]["LearnLesson"];
export type ContentBlock = components["schemas"]["ContentBlock"];
export type LessonProgress = components["schemas"]["LessonProgress"];

export function getLearnTrack(trackSlug: string) {
  return apiRequest<LearnTrack>(`/learn/tracks/${encodeURIComponent(trackSlug)}`, { cache: "no-store" });
}

export function getLearnLesson(lessonId: string) {
  return apiRequest<LearnLesson>(`/learn/lessons/${encodeURIComponent(lessonId)}`, { cache: "no-store" });
}

export function updateLessonProgress(lessonId: string, action: "start" | "complete") {
  return apiRequest<LessonProgress>(`/learn/lessons/${encodeURIComponent(lessonId)}/progress`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
