import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FileRecord } from "@/types/database";

export const FILE_BUCKET = "holiday-light-files";

export type AppFile = FileRecord & { preview_url: string | null };

export async function getFiles(organizationId: string, relatedType: string, relatedId: string): Promise<AppFile[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("files").select("*").eq("organization_id", organizationId).eq("related_type", relatedType).eq("related_id", relatedId).order("created_at", { ascending: false });
  if (error) throw new Error("We could not load photos and files. Please try again.");

  return Promise.all((data ?? []).map(async (file) => {
    const path = file.storage_path || file.file_url;
    if (!path) return { ...file, preview_url: null } as AppFile;
    const { data: signed } = await supabase.storage.from(FILE_BUCKET).createSignedUrl(path, 60 * 60);
    return { ...file, preview_url: signed?.signedUrl ?? null } as AppFile;
  }));
}
