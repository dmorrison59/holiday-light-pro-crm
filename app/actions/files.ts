"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/auth/current";
import { FILE_BUCKET } from "@/lib/files";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FileActionState = { error?: string; success?: string; nonce?: number };

function pagePath(type: string, id: string) { return `/${type}/${id}`; }

function storageMessage(message: string) {
  if (/bucket.*not found|not found.*bucket/i.test(message)) return "Storage bucket not found. Create the holiday-light-files bucket in Supabase.";
  if (/permission|policy|row-level security|unauthorized/i.test(message)) return "You do not have permission to upload this file. Check the Supabase Storage policies.";
  return "The file could not be uploaded. Please try again.";
}

export async function deleteFileAction(fileId: string): Promise<FileActionState> {
  try {
    const { organization } = await requireOrganization();
    const supabase = await createSupabaseServerClient();
    const { data: file, error } = await supabase.from("files").select("*").eq("id", fileId).eq("organization_id", organization.id).maybeSingle();
    if (error) return { error: "We could not load that file." };
    if (!file) return { error: "File not found." };
    const path = file.storage_path || file.file_url;
    if (path) {
      const { error: storageError } = await supabase.storage.from(FILE_BUCKET).remove([path]);
      if (storageError) return { error: storageMessage(storageError.message).replace("upload", "delete") };
    }
    const { error: deleteError } = await supabase.from("files").delete().eq("id", file.id).eq("organization_id", organization.id);
    if (deleteError) return { error: "The stored file was deleted, but its database record could not be removed. Please refresh and try again." };
    revalidatePath(pagePath(file.related_type, file.related_id));
    return { success: "File deleted.", nonce: Date.now() };
  } catch (error) { return { error: error instanceof Error ? error.message : "The file could not be deleted." }; }
}
