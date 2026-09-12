"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getLearnTrack, type LearnTrack } from "@/lib/api/learning";
import { ApiError } from "@/lib/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LOCKED: "outline",
  AVAILABLE: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "default",
};

export function TrackNavigation({ trackSlug }: { trackSlug: string }) {
  const [track, setTrack] = useState<LearnTrack | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLearnTrack(trackSlug)
      .then((result) => {
        if (!cancelled) setTrack(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "We couldn't load this track.");
      });
    return () => {
      cancelled = true;
    };
  }, [trackSlug]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!track) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{track.title}</h1>
      {track.courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.modules.map((module_) => (
              <div key={module_.id} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{module_.title}</p>
                <ul className="space-y-1">
                  {module_.lessons.map((lesson) => {
                    const locked = lesson.status === "LOCKED";
                    return (
                      <li key={lesson.id}>
                        {locked ? (
                          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground">
                            <Badge variant={STATUS_VARIANT[lesson.status]}>{lesson.status}</Badge>
                            <span>{lesson.title}</span>
                          </div>
                        ) : (
                          <Link
                            href={`/dashboard/learn/${lesson.id}`}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                          >
                            <Badge variant={STATUS_VARIANT[lesson.status]}>{lesson.status}</Badge>
                            <span>{lesson.title}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
