-- Create storage bucket for request documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('request-documents', 'request-documents', false, 5242880)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'request-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'request-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'request-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'request-documents' 
  AND (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'agent')
    OR public.has_role(auth.uid(), 'super_admin')
  )
);

-- Enable realtime for requests table
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;