import type { ContentBlock } from "@/lib/api/learning";
import { LabFrame } from "@/components/learn/lab-frame";

type TextSpan = { text: string; marks?: string[] };
type LinkSpan = { type: "link"; href: string; children: TextSpan[] };

function RichText({ spans }: { spans: (TextSpan | LinkSpan)[] }) {
  return (
    <>
      {spans.map((span, index) => {
        if ("type" in span && span.type === "link") {
          return (
            <a key={index} href={span.href} className="text-primary underline underline-offset-2" target="_blank" rel="noreferrer">
              {span.children.map((child) => child.text).join("")}
            </a>
          );
        }
        const textSpan = span as TextSpan;
        let node: React.ReactNode = textSpan.text;
        if (textSpan.marks?.includes("code")) node = <code className="rounded bg-muted px-1 py-0.5 text-xs">{node}</code>;
        if (textSpan.marks?.includes("bold")) node = <strong>{node}</strong>;
        if (textSpan.marks?.includes("italic")) node = <em>{node}</em>;
        return <span key={index}>{node}</span>;
      })}
    </>
  );
}

export function BlockRenderer({ block, lessonId }: { block: ContentBlock; lessonId: string }) {
  const data = (block.data ?? {}) as Record<string, unknown>;

  switch (block.type) {
    case "heading": {
      const level = Number(data.level ?? 2);
      const className = level === 2 ? "text-xl font-semibold" : level === 3 ? "text-lg font-semibold" : "text-base font-semibold";
      return <p className={className}>{String(data.text ?? "")}</p>;
    }
    case "paragraph":
      return <p className="text-sm leading-relaxed"><RichText spans={(data.richText as (TextSpan | LinkSpan)[]) ?? []} /></p>;
    case "list": {
      const Tag = data.style === "ordered" ? "ol" : "ul";
      const items = (data.items as { richText: (TextSpan | LinkSpan)[]; children?: { richText: (TextSpan | LinkSpan)[] }[] }[]) ?? [];
      return (
        <Tag className={data.style === "ordered" ? "list-decimal pl-5 text-sm" : "list-disc pl-5 text-sm"}>
          {items.map((item, index) => (
            <li key={index}>
              <RichText spans={item.richText} />
              {item.children && item.children.length > 0 && (
                <ul className="list-disc pl-5">
                  {item.children.map((child, childIndex) => (
                    <li key={childIndex}><RichText spans={child.richText} /></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Tag>
      );
    }
    case "table": {
      const headers = (data.headers as (TextSpan | LinkSpan)[][]) ?? [];
      const rows = (data.rows as (TextSpan | LinkSpan)[][][]) ?? [];
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>{headers.map((cell, index) => <th key={index} className="border p-2 text-left font-medium"><RichText spans={cell} /></th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border p-2"><RichText spans={cell} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "code":
      return (
        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
          <code>{String(data.code ?? "")}</code>
        </pre>
      );
    case "callout": {
      const toneClass: Record<string, string> = {
        info: "border-blue-300 bg-blue-50 dark:bg-blue-950",
        success: "border-green-300 bg-green-50 dark:bg-green-950",
        warning: "border-yellow-300 bg-yellow-50 dark:bg-yellow-950",
        danger: "border-red-300 bg-red-50 dark:bg-red-950",
      };
      return (
        <div className={`rounded-md border p-3 text-sm ${toneClass[String(data.tone)] ?? ""}`}>
          {data.title ? <p className="font-medium">{String(data.title)}</p> : null}
          <p>{String(data.body ?? "")}</p>
        </div>
      );
    }
    case "image":
      return data.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={String(data.url)} alt={String(data.alt ?? "")} className="max-w-full rounded-md" />
      ) : (
        <p className="text-xs text-muted-foreground">Image unavailable.</p>
      );
    case "divider":
      return <hr className="border-t" />;
    case "lab":
      return <LabFrame url={typeof data.url === "string" ? data.url : null} title={String(data.title ?? "Lab")} lessonId={lessonId} />;
    case "reusableSnapshot": {
      const nested = (data.blocks as ContentBlock[]) ?? [];
      return (
        <div className="space-y-2 rounded-md border border-dashed p-3">
          {nested.map((nestedBlock) => <BlockRenderer key={nestedBlock.id} block={nestedBlock} lessonId={lessonId} />)}
        </div>
      );
    }
    default:
      // Unknown/unsupported block type or version: a safe placeholder, never
      // a crash and never raw JSON rendered to the page.
      return (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          This part of the lesson isn&apos;t available right now.
        </div>
      );
  }
}
