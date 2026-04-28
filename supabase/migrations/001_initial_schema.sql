CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT,
  file_path TEXT,
  raw_text TEXT NOT NULL,
  cleaned_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'uploaded',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  heading TEXT,
  content TEXT NOT NULL,
  token_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Concept',
  description TEXT,
  properties JSONB DEFAULT '{}',
  source_chunk_ids UUID[] DEFAULT '{}',
  confidence NUMERIC DEFAULT 0.0,
  x NUMERIC,
  y NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(document_id, node_key)
);

CREATE TABLE graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  from_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL DEFAULT 'related_to',
  label TEXT NOT NULL,
  description TEXT,
  properties JSONB DEFAULT '{}',
  source_chunk_ids UUID[] DEFAULT '{}',
  evidence_text TEXT,
  confidence NUMERIC DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE extraction_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  step TEXT,
  input_summary TEXT,
  output_summary TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX document_chunks_document_id_idx ON document_chunks(document_id);
CREATE INDEX graph_nodes_document_id_idx ON graph_nodes(document_id);
CREATE INDEX graph_edges_document_id_idx ON graph_edges(document_id);
CREATE INDEX extraction_jobs_document_id_idx ON extraction_jobs(document_id);
