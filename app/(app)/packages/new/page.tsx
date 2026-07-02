import { PackageForm } from "@/components/packages/package-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
export const metadata = { title: "Add Package" };
export default function NewPackagePage() { return <div className="mx-auto max-w-4xl space-y-7"><PageHeader title="Add Package" description="Create a reusable package for faster, more consistent sales conversations." /><Card><CardContent className="p-5 sm:p-7"><PackageForm /></CardContent></Card></div>; }
