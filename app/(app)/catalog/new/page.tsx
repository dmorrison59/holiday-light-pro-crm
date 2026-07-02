import { CatalogItemForm } from "@/components/catalog/catalog-item-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
export const metadata = { title: "Add Catalog Item" };
export default function NewCatalogItemPage() { return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Add Catalog Item" description="Add a product, service, or internal supply item to your company catalog." /><Card><CardContent className="p-5 sm:p-7"><CatalogItemForm /></CardContent></Card></div>; }
