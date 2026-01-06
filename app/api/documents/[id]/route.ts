import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const BUCKET_NAME = 'deal-documents'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    // Buscar documento
    const { data: document, error: fetchError } = await supabase
      .from('deal_documents')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Deletar do storage usando server client
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([document.file_path])
    
    if (storageError) {
      console.error('Storage delete error:', storageError)
    }

    // Deletar do banco
    const { error: dbError } = await supabase
      .from('deal_documents')
      .delete()
      .eq('id', params.id)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}




