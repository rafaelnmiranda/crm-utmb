import { supabase } from './client'

const BUCKET_NAME = 'deal-documents'

export async function uploadDocument(
  dealId: string,
  file: File
): Promise<{ path: string; error: Error | null }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${dealId}/${fileName}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file)

  if (error) {
    return { path: '', error }
  }

  return { path: filePath, error: null }
}

export async function getDocumentUrl(filePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteDocument(filePath: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  return { error }
}

export async function downloadDocument(filePath: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath)

  if (error || !data) {
    return null
  }

  return data
}




