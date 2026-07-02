import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel?: string;
  actionHref?: string;
};

export function PlaceholderPage({ title, description, icon: Icon, emptyTitle, emptyDescription, actionLabel, actionHref }: PlaceholderPageProps) {
  return (
    <div className="space-y-7">
      <PageHeader title={title} description={description} />
      <EmptyState icon={<Icon className="size-5" />} title={emptyTitle} description={emptyDescription} actionLabel={actionLabel} actionHref={actionHref} />
    </div>
  );
}
