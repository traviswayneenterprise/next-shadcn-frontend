import { constructMetadata } from "@/lib/utils";
import { TrackNavigation } from "@/components/learn/track-navigation";

export const metadata = constructMetadata({ title: "Learn", description: "Your enrolled curriculum." });

export default function LearnPage() {
  return <TrackNavigation trackSlug="software-dev-2026" />;
}
