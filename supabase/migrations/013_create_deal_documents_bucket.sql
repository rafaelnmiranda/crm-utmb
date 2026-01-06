-- Criar bucket público para documentos dos deals
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deal-documents',
  'deal-documents',
  true,
  52428800, -- 50MB
  NULL -- Permite qualquer tipo de arquivo
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Remover policies existentes (se houver) para garantir idempotência
DROP POLICY IF EXISTS "Public can view deal documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload deal documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete deal documents" ON storage.objects;

-- Policy: Permitir SELECT (leitura) público para todos
CREATE POLICY "Public can view deal documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'deal-documents');

-- Policy: Permitir INSERT (upload) apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload deal documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deal-documents');

-- Policy: Permitir DELETE apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete deal documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'deal-documents');
