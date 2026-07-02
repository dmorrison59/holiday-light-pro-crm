import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getFiles } from "@/lib/files";
import { FileManager } from "./file-manager";

export async function FileSection({ organizationId, relatedType, relatedId, photoTypes, emptyText, helperText }: { organizationId: string; relatedType: string; relatedId: string; photoTypes: string[]; emptyText: string; helperText?: string }) {
  let files;
  try { files = await getFiles(organizationId, relatedType, relatedId); }
  catch (error) { return <Card><CardHeader><h2 className="text-xl font-bold text-slate-950">Photos &amp; Files</h2></CardHeader><CardContent><p role="alert" className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800">{error instanceof Error ? error.message : "We could not load photos and files."}</p></CardContent></Card>; }
  return <section aria-labelledby={`${relatedType}-files-title`}><Card><CardHeader><h2 id={`${relatedType}-files-title`} className="text-xl font-bold text-slate-950">Photos &amp; Files</h2><p className="mt-1 text-sm text-slate-500">{helperText || "Add field photos, reference images, and PDFs."}</p></CardHeader><CardContent><FileManager files={files} organizationId={organizationId} relatedType={relatedType} relatedId={relatedId} photoTypes={photoTypes} emptyText={emptyText} /></CardContent></Card></section>;
}
