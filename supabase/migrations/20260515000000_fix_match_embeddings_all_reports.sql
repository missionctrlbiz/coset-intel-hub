-- Fix match_report_embeddings to support optional report filtering.
-- Previously filter_report_id was required, which broke general/cross-report
-- semantic search and prevented the chatbot from doing RAG across all reports.
DROP FUNCTION IF EXISTS match_report_embeddings(vector(768), float, int, uuid);

CREATE OR REPLACE FUNCTION match_report_embeddings(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_report_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  report_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    report_embeddings.id,
    report_embeddings.report_id,
    report_embeddings.content,
    1 - (report_embeddings.embedding <=> query_embedding) AS similarity
  FROM report_embeddings
  WHERE (filter_report_id IS NULL OR report_embeddings.report_id = filter_report_id)
    AND 1 - (report_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY (report_embeddings.embedding <=> query_embedding) ASC
  LIMIT match_count;
END;
$$;
