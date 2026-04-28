export function buildExtractGraphPrompt(chunks: { chunkIndex: number; content: string }[]) {
  const source = chunks
    .map((chunk) => `# chunk ${chunk.chunkIndex}\n${chunk.content}`)
    .join("\n\n---\n\n");

  return `You extract an ontology-style knowledge graph from business documents.
Return JSON only. Do not include markdown.

Schema:
{
  "nodes": [
    {
      "node_key": "stable lowercase key",
      "label": "display label",
      "type": "Concept | Company | Person | Product | Service | Technology | Problem | Solution | Rule | Criterion | DocumentSection | Organization | Unknown",
      "description": "short description grounded in the source",
      "properties": {},
      "source_chunk_indexes": [0],
      "confidence": 0.0
    }
  ],
  "edges": [
    {
      "from_node_key": "source key",
      "to_node_key": "target key",
      "relation_type": "provides | belongs_to | part_of | solves | causes | depends_on | related_to | based_on | requires | explains | mentions | evidence_for",
      "label": "short relation label",
      "description": "why this relation exists",
      "evidence_text": "short source excerpt",
      "source_chunk_indexes": [0],
      "confidence": 0.0
    }
  ]
}

Extract important concepts, entities, rules, criteria, problems, solutions, organizations, products, services, and technologies.

Source:
${source}`;
}
