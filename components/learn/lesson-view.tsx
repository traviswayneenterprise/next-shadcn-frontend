"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { getLearnLesson, updateLessonProgress, type LearnLesson } from "@/lib/api/learning";
import { ApiError } from "@/lib/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockRenderer } from "@/components/learn/block-renderers";

export function LessonView({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<LearnLesson | null>(null);
  const [error, setError] = useState<{ message: string; locked: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    getLearnLesson(lessonId)
      .then((result) => {
        setLesson(result);
        setError(null);
      })
      .catch((err) => {
        const locked = err instanceof ApiError && (err.status === 423 || err.status === 403 || err.status === 404);
        setError({ message: err instanceof ApiError ? err.message : "We couldn't load this lesson.", locked });
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  function markStarted() {
    startTransition(async () => {
      await updateLessonProgress(lessonId, "start").catch(() => undefined);
      load();
    });
  }

  function markComplete() {
    startTransition(async () => {
      await updateLessonProgress(lessonId, "complete").catch(() => undefined);
      load();
    });
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/learn" className="text-sm text-primary underline underline-offset-2">
          Back to curriculum
        </Link>
        <Alert variant={error.locked ? "default" : "destructive"}>
          <AlertTitle>{error.locked ? "Not available yet" : "Something went wrong"}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!lesson || lesson.locked) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/dashboard/learn" className="text-sm text-primary underline underline-offset-2">
            Back to curriculum
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{lesson.lesson?.title}</h1>
        </div>
        <Badge>{lesson.progressStatus}</Badge>
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        {(lesson.blocks ?? []).map((block) => (
          <BlockRenderer key={block.id} block={block} lessonId={lessonId} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        {lesson.progressStatus === "AVAILABLE" && (
          <Button onClick={markStarted} disabled={isPending}>Start lesson</Button>
        )}
        {lesson.progressStatus === "IN_PROGRESS" && (
          <Button onClick={markComplete} disabled={isPending}>Mark complete</Button>
        )}
        {lesson.progressStatus === "COMPLETED" && <Badge variant="secondary">Completed</Badge>}
      </div>
    </div>
  );
}
