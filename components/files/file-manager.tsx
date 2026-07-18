"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, ImageIcon, Trash2, Upload } from "lucide-react";
import { deleteFileAction, type FileActionState } from "@/app/actions/files";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AppFile } from "@/lib/files";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const date = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
const FILE_BUCKET = "holiday-light-files";
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const safeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+/, "").slice(-120) || "upload";
const uploadError = (message: string) => /bucket.*not found|not found.*bucket/i.test(message) ? "Storage bucket not found. Create the holiday-light-files bucket in Supabase." : /permission|policy|row-level security|unauthorized/i.test(message) ? "You do not have permission to upload this file. Check the Supabase Storage policies." : "The file could not be uploaded. Please try again.";
const metadataError = (message: string) => /column.*uploaded_by/i.test(message) ? "File metadata migration is required. Run the file metadata migration in Supabase, then try again." : /permission|policy|row-level security|unauthorized/i.test(message) ? "You do not have permission to save this file. Check that your account belongs to this organization." : /foreign key/i.test(message) ? "This file could not be attached to the requested record. Refresh the page and try again." : "The file uploaded, but its details could not be saved. The upload was rolled back.";

export function FileManager({ files, organizationId, relatedType, relatedId, photoTypes, emptyText }: { files: AppFile[]; organizationId: string; relatedType: string; relatedId: string; photoTypes: string[]; emptyText: string }) {
  const router = useRouter();
  const [state, setState] = useState<FileActionState>({});
  const [pending, setPending] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<FileActionState>({});
  const [deleting, startDelete] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({});
    const form = event.currentTarget;
    const data = new FormData(form);
    const selected = data.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
    if (!selected.length) return setState({ error: "Choose at least one photo or file to upload." });
    if (selected.some((file) => file.size > 10 * 1024 * 1024)) return setState({ error: "File is too large. Please upload a file under 10 MB." });
    if (selected.some((file) => !allowedMimeTypes.has(file.type))) return setState({ error: "Unsupported file type. Upload a JPG, PNG, WebP, or PDF file." });

    setPending(true);
    let uploaded = 0;
    try {
      const supabase = getSupabaseBrowserClient();
      const description = String(data.get("description") ?? "").trim() || null;
      const photoType = String(data.get("photo_type") ?? "").trim() || null;
      const customerVisible = relatedType === "quotes" && data.get("customer_visible") === "on";
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("SESSION_EXPIRED");

      for (const file of selected) {
        const path = `${organizationId}/${relatedType}/${relatedId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName(file.name)}`;
        const { error: storageError } = await supabase.storage.from(FILE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
        if (storageError) return setState({ error: uploadError(storageError.message) });

        const { error: insertError } = await supabase.from("files").insert({ organization_id: organizationId, related_type: relatedType, related_id: relatedId, file_url: path, storage_path: path, file_name: file.name, file_type: file.type.startsWith("image/") ? "image" : "document", file_size: file.size, mime_type: file.type, description, photo_type: photoType, customer_visible: customerVisible, uploaded_by: auth.user.id });
        if (insertError) {
          const { error: rollbackError } = await supabase.storage.from(FILE_BUCKET).remove([path]);
          const message = metadataError(insertError.message);
          return setState({ error: rollbackError ? `${message} The stored object could not be removed automatically; contact support.` : message });
        }
        uploaded += 1;
      }

      form.reset();
      setState({ success: `${uploaded} ${uploaded === 1 ? "file" : "files"} uploaded.` });
    } catch (error) {
      setState({ error: error instanceof Error && error.message === "SESSION_EXPIRED" ? "Your session has expired. Sign in and try again." : "The upload could not be completed. Check your connection and try again." });
    } finally {
      setPending(false);
      if (uploaded > 0) router.refresh();
    }
  }

  function remove(id: string) {
    if (!window.confirm("Delete this file? This cannot be undone.")) return;
    setDeleteMessage({});
    startDelete(async () => setDeleteMessage(await deleteFileAction(id)));
  }

  return <div className="space-y-6">
    <form ref={formRef} onSubmit={upload} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Photo type<Select name="photo_type" className="mt-1.5"><option value="">Choose a type (optional)</option>{photoTypes.map((type) => <option key={type}>{type}</option>)}</Select></label><label className="block text-sm font-semibold text-slate-700">Add photos or PDF<Input name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="mt-1.5 h-auto min-h-11 cursor-pointer py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-1 file:font-semibold" required /></label></div>
      <label className="block text-sm font-semibold text-slate-700">Description<Textarea name="description" className="mt-1.5 min-h-20" placeholder="What does this photo show?" /></label>
      {relatedType === "quotes" ? <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" name="customer_visible" className="size-4 accent-amber-500" />Customer-facing proposal file</label> : null}
      <p className="text-xs text-slate-500">JPG, PNG, WebP, or PDF. Maximum 10 MB per file.</p>
      {state.error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{state.error}</p> : null}{state.success ? <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{state.success}</p> : null}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto"><Upload className="mr-2 size-4" />{pending ? "Uploading…" : "Upload Photos"}</Button>
    </form>
    {deleteMessage.error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{deleteMessage.error}</p> : null}{deleteMessage.success ? <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{deleteMessage.success}</p> : null}
    {files.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{files.map((file) => { const image = file.mime_type?.startsWith("image/") || file.file_type === "image"; return <article key={file.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white"><a href={file.preview_url || undefined} target="_blank" rel="noreferrer" className="block bg-slate-100" aria-label={`Open ${file.file_name}`}>{image && file.preview_url ? <img src={file.preview_url} alt={file.description || file.file_name} className="h-44 w-full object-cover" /> : <span className="flex h-32 items-center justify-center text-slate-400">{image ? <ImageIcon className="size-10" /> : <FileText className="size-10" />}</span>}</a><div className="space-y-2 p-4"><p className="break-words text-sm font-bold text-slate-950">{file.file_name}</p>{file.photo_type ? <p className="text-xs font-semibold text-amber-800">{file.photo_type}</p> : null}{file.description ? <p className="text-sm leading-5 text-slate-600">{file.description}</p> : null}<p className="text-xs text-slate-500">{date(file.created_at)}</p><div className="flex gap-2 pt-1">{file.preview_url ? <a href={file.preview_url} target="_blank" rel="noreferrer" className="inline-flex h-9 flex-1 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-50"><ExternalLink className="mr-1.5 size-4" />Open</a> : null}<Button type="button" size="sm" variant="danger" disabled={deleting} onClick={() => remove(file.id)}><Trash2 className="mr-1.5 size-4" />Delete</Button></div></div></article>; })}</div> : <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center"><ImageIcon className="mx-auto size-7 text-slate-400" /><p className="mt-3 text-sm text-slate-600">{emptyText}</p></div>}
  </div>;
}
