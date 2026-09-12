"use client";

import { useEffect, useRef, useState } from "react";

import { parseLabMessage } from "@/lib/labs/messaging";
import { Badge } from "@/components/ui/badge";

function safeOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function LabFrame({ url, title, lessonId }: { url: string | null; title: string; lessonId: string }) {
  const expectedOrigin = url ? safeOrigin(url) : null;
  const [status, setStatus] = useState<"loading" | "ready" | "error">(expectedOrigin ? "loading" : "error");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!expectedOrigin) return;

    function handleMessage(event: MessageEvent) {
      // Never trust postMessage without checking the exact origin first -
      // the sandboxed iframe's own origin, not the app's own.
      if (event.origin !== expectedOrigin) return;
      const message = parseLabMessage(event.data, lessonId);
      if (!message) return;
      if (message.event === "ready") setStatus("ready");
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [expectedOrigin, lessonId]);

  if (!url || !expectedOrigin) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        This lab isn&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline">interactive lab</Badge>
        <span className="text-sm font-medium">{title}</span>
      </div>
      {status === "loading" && <p className="text-xs text-muted-foreground">Loading lab...</p>}
      {status === "error" && <p className="text-xs text-destructive">The lab failed to load.</p>}
      <iframe
        ref={iframeRef}
        src={url}
        title={title}
        // No allow-same-origin: the lab's storage/cookies stay isolated from
        // this app and from every other lab. No allow-top-navigation or
        // allow-popups either - a lab page cannot navigate the learner away.
        sandbox="allow-scripts allow-forms"
        className="h-[640px] w-full rounded-md border"
        onLoad={() => setStatus((current) => (current === "loading" ? "ready" : current))}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
