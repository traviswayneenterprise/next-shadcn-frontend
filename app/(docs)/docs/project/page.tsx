import { readProjectDoc } from "@/lib/internal-docs";
import ProjectDocPage from "./[...slug]/page";

export default async function ProjectDocsIndexPage() {
  const hasReadme = (await readProjectDoc(["README"])) !== null;
  if (hasReadme) {
    return <ProjectDocPage params={Promise.resolve({ slug: ["README"] })} />;
  }
  return (
    <p className="mx-auto max-w-3xl py-6 text-sm text-muted-foreground">
      Select a document from the sidebar to view it.
    </p>
  );
}
