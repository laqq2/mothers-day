import { notFound } from "next/navigation";

import { TimelineViewer } from "@/components/timeline/timeline-viewer";
import { getTimelineBySlug } from "@/lib/supabase";

type TimelineViewerPageProps = {
  params: {
    slug: string;
  };
};

export default async function TimelineViewerPage({ params }: TimelineViewerPageProps) {
  const payload = await getTimelineBySlug(params.slug);

  if (!payload || payload.cards.length === 0) {
    notFound();
  }

  return <TimelineViewer payload={payload} />;
}
