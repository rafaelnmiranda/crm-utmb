import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const BUCKET_NAME = 'deal-documents'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const dealId = formData.get('deal_id') as string

    if (!file || !dealId) {
      return NextResponse.json(
        { error: 'File and deal_id are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Upload do arquivo para o storage usando server client
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${dealId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    // Salvar referência no banco
    const { data, error: dbError } = await supabase
      .from('deal_documents')
      .insert([{
        deal_id: dealId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
      }])
      .select()
      .single()

    if (dbError) {
      // Se falhar ao salvar no banco, tentar remover o arquivo do storage
      await supabase.storage.from(BUCKET_NAME).remove([filePath])
      throw dbError
    }

    // Retornar dados com URL pública
    return NextResponse.json(
      { ...data, public_url: urlData.publicUrl },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}




