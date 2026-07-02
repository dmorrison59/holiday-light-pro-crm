import { BookX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
export default function CatalogItemNotFound() { return <EmptyState icon={<BookX className="size-5" />} title="Catalog item not found" description="This item may have been deleted, or it does not belong to your company." actionLabel="Back to Catalog" actionHref="/catalog" />; }
