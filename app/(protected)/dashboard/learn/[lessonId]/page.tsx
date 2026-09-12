import { constructMetadata } from "@/lib/utils";
import { LessonView } from "@/components/learn/lesson-view";

export const metadata = constructMetadata({ title: "Lesson", description: "Lesson content." });

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LessonView lessonId={lessonId} />;
}
