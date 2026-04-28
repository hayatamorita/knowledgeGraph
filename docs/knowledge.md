# オントロジーグラフ型ウェブアプリ作成に必要な知識まとめ
# 目的：
# 企業内の業務知識・文書・判断基準・ルール・根拠情報を
# 「オントロジー + ナレッジグラフ + RAG + AIエージェント」として統合し、
# ユーザーがWeb UI上で業務質問・判断支援・文書検索・ルール確認を行えるアプリを作る。

================================================================================
0. 前提整理
================================================================================

Cliffhanger社が公開情報で示している「オントロジーグラフ」は、
単なるベクトル検索RAGではなく、以下を構造化する仕組みと考える。

- 業務概念
- 業務データ
- 業務ルール
- 判断基準
- 例外条件
- 根拠文書
- 承認フロー
- 担当者・部署
- AIが回答時に参照すべき制約

完全に同一のものを作るには、同社の非公開仕様が必要。
ただし、同等のWebアプリは公開技術で作れる。

作るべきものは以下：

「社内文書や業務データを読み込み、
  業務概念・関係・判断基準としてグラフ化し、
  ユーザーの質問に対して、
  関連文書検索だけでなく、
  条件判定・ルール適用・根拠提示まで行うAI Webアプリ」

================================================================================
1. 必要な全体技術領域
================================================================================

必要な知識は大きく以下。

1. Webアプリ開発
2. データベース設計
3. オントロジー設計
4. ナレッジグラフ設計
5. 文書取り込み・ETL
6. ベクトル検索
7. RAG
8. GraphRAG
9. ルールエンジン
10. LLM API連携
11. AIエージェント設計
12. UI/UX設計
13. 認証・権限管理
14. セキュリティ
15. 評価・改善
16. デプロイ・運用

================================================================================
2. 推奨技術スタック
================================================================================

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Flow または Cytoscape.js
- Zustand / Jotai / TanStack Query

Backend:
- Node.js
- Hono / Fastify / Express
- Python FastAPI
- Cloudflare Workers
- Supabase Edge Functions

Database:
- PostgreSQL
- Supabase
- pgvector
- JSONB
- optional: Neo4j
- optional: RDF triple store
- optional: GraphDB / Apache Jena / RDF4J

AI:
- OpenAI API
- Claude API
- Gemini API
- local LLM
- Embedding API
- reranker model

Document Processing:
- Python
- LangChain
- LlamaIndex
- Unstructured
- PyMuPDF
- pdfplumber
- pandas
- openpyxl
- OCR if necessary

Graph / Ontology:
- RDF
- OWL
- SHACL
- SPARQL
- property graph
- Cypher
- JSON Schema
- Pydantic

Deployment:
- Vercel
- Cloudflare
- Supabase
- Docker
- AWS / GCP / Azure
- Kubernetes if enterprise scale

================================================================================
3. Webアプリとして必要な主要機能
================================================================================

MVPで必要な機能：

1. ログイン機能
2. 組織・ユーザー管理
3. 文書アップロード
4. 文書解析
5. チャンク分割
6. メタデータ抽出
7. 埋め込み生成
8. ベクトルDB保存
9. オントロジー編集
10. エンティティ登録
11. 関係登録
12. 業務ルール登録
13. 判断基準登録
14. ナレッジグラフ表示
15. チャットUI
16. RAG回答
17. GraphRAG回答
18. 判断理由表示
19. 根拠文書表示
20. 管理者レビュー
21. 評価ログ保存

発展機能：

1. LINE連携
2. Slack連携
3. Notion連携
4. Google Drive連携
5. Google Sheets連携
6. 社内DB連携
7. 承認ワークフロー
8. 自動ルール抽出
9. 自動エンティティ抽出
10. グラフ自動生成
11. 権限別検索
12. 監査ログ
13. LLM切り替え
14. オンプレ対応
15. ローカルLLM対応

================================================================================
4. アプリの基本アーキテクチャ
================================================================================

[User]
  ↓
[Next.js Web UI]
  ↓
[Backend API]
  ↓
[Query Router]
  ↓
  ├── Vector Search
  ├── Graph Search
  ├── Rule Engine
  ├── Ontology Lookup
  ├── Document Retriever
  └── LLM Orchestrator
        ↓
      [LLM]
        ↓
[Answer + Evidence + Applied Rules]
  ↓
[Web UI]

データ登録時：

[PDF / Excel / Notion / Slack / DB]
  ↓
[Ingestion Pipeline]
  ↓
[Text Extraction]
  ↓
[Chunking]
  ↓
[Metadata Extraction]
  ↓
[Entity Extraction]
  ↓
[Relation Extraction]
  ↓
[Ontology Mapping]
  ↓
[Embedding Generation]
  ↓
[PostgreSQL + pgvector + Graph Tables]

================================================================================
5. オントロジー設計の知識
================================================================================

オントロジーとは、業務世界の概念・関係・制約を定義したもの。

必要な概念：

Class:
- Customer
- Company
- Department
- User
- Role
- Product
- Service
- Proposal
- Contract
- Policy
- BusinessRule
- DecisionCriterion
- EvidenceDocument
- ApprovalFlow
- Task
- FAQ
- Case
- Risk
- ExceptionCondition

Property:
- belongsTo
- managedBy
- createdBy
- approvedBy
- requiresApprovalBy
- targets
- proposes
- dependsOn
- violates
- satisfies
- groundedIn
- hasCriterion
- hasCondition
- hasException
- relatedTo
- derivedFrom
- references

Constraint:
- 顧客には業界分類が必要
- 提案書には対象顧客が必要
- 業務ルールには根拠文書が必要
- 判断基準には条件文が必要
- 承認フローには承認者が必要
- 禁止ルールには違反時の処理が必要

Ontology designで必要な能力：

- 業務ヒアリング
- 業務フロー分解
- 用語定義
- 同義語整理
- 概念階層化
- エンティティ分類
- 関係定義
- 制約定義
- 例外条件定義
- ルール優先順位設計
- バージョン管理

================================================================================
6. RDF / OWL / SHACL / SPARQL の知識
================================================================================

RDF:
- 主語・述語・目的語の三つ組で知識を表現する。
- 例：
  Proposal_001 targets Customer_A
  Proposal_001 mustSatisfy Rule_Discount
  Rule_Discount groundedIn SalesPolicy_2026

OWL:
- クラス、プロパティ、個体、制約を定義する。
- 例：
  Proposal is a BusinessDocument
  Customer is an Organization
  requiresApprovalBy has range User

SHACL:
- グラフデータがルールを満たすか検証する。
- 例：
  Proposal must have exactly one target customer.
  BusinessRule must have at least one evidence document.

SPARQL:
- RDFグラフを検索するクエリ言語。
- 例：
  「20%以上の値引きを含む提案書に必要な承認者を取得する」
  「この回答の根拠となった文書を取得する」

Webアプリとしては、最初からRDF/OWLを厳密に使わなくてもよい。
MVPではPostgreSQL上に独自スキーマとして実装し、
将来的にRDF/OWL互換にするのが現実的。

================================================================================
7. Property Graph の知識
================================================================================

Property Graphでは、知識をNodeとEdgeで表す。

Node examples:
- Customer
- Proposal
- Product
- Rule
- Criterion
- Document
- User
- Department

Edge examples:
- Customer --belongs_to--> Industry
- Proposal --targets--> Customer
- Proposal --proposes--> Product
- Proposal --must_satisfy--> BusinessRule
- BusinessRule --has_criterion--> DecisionCriterion
- BusinessRule --grounded_in--> Document
- Proposal --requires_approval_by--> User

Property examples:
- name
- description
- type
- source
- confidence
- created_at
- updated_at
- version
- access_level

Neo4jを使う場合：
- Cypherを学ぶ。
- MATCH, WHERE, RETURN, MERGE, CREATEを使う。
- グラフ探索が簡単。
- 可視化しやすい。

PostgreSQLで実装する場合：
- nodes table
- edges table
- node_properties JSONB
- edge_properties JSONB
- recursive query
- pgvector
- full-text search
- Row Level Security

================================================================================
8. PostgreSQLでの基本データ設計
================================================================================

Table: organizations
- id
- name
- created_at

Table: users
- id
- organization_id
- name
- email
- role
- created_at

Table: documents
- id
- organization_id
- title
- source_type
- source_url
- file_path
- text_content
- metadata JSONB
- created_at
- updated_at

Table: document_chunks
- id
- document_id
- chunk_index
- content
- embedding vector
- metadata JSONB
- created_at

Table: ontology_classes
- id
- organization_id
- name
- label
- description
- parent_class_id
- metadata JSONB

Table: ontology_properties
- id
- organization_id
- name
- label
- domain_class_id
- range_class_id
- description
- metadata JSONB

Table: graph_nodes
- id
- organization_id
- class_id
- name
- label
- description
- properties JSONB
- source_document_id
- confidence
- created_at
- updated_at

Table: graph_edges
- id
- organization_id
- from_node_id
- to_node_id
- property_id
- label
- properties JSONB
- source_document_id
- confidence
- created_at

Table: business_rules
- id
- organization_id
- name
- description
- rule_type
- condition_json JSONB
- action_json JSONB
- priority
- source_document_id
- active
- created_at
- updated_at

Table: decision_criteria
- id
- organization_id
- rule_id
- name
- description
- condition_text
- condition_json JSONB
- expected_action
- evidence_document_id
- priority

Table: conversations
- id
- organization_id
- user_id
- title
- created_at

Table: messages
- id
- conversation_id
- role
- content
- metadata JSONB
- created_at

Table: answer_evidences
- id
- message_id
- document_id
- chunk_id
- graph_node_id
- graph_edge_id
- rule_id
- relevance_score

Table: evaluations
- id
- organization_id
- question
- expected_answer
- expected_evidence
- actual_answer
- score
- notes
- created_at

================================================================================
9. 文書取り込み・ETLの知識
================================================================================

取り込むデータ：
- PDF
- Word
- Excel
- CSV
- PowerPoint
- Notion
- Slack
- Google Docs
- Google Sheets
- Webページ
- 社内DB
- FAQ
- マニュアル
- 規程
- 契約書
- 提案書
- 議事録

ETL手順：

1. ファイル取得
2. テキスト抽出
3. 表抽出
4. 画像・図表の処理
5. メタデータ付与
6. チャンク分割
7. エンティティ抽出
8. 関係抽出
9. ルール候補抽出
10. 人間レビュー
11. DB保存
12. Embedding生成
13. Graph登録

必要な知識：

- PDF parsing
- OCR
- table extraction
- document chunking
- semantic chunking
- metadata design
- source traceability
- version control
- deduplication
- incremental indexing

================================================================================
10. チャンク分割の知識
================================================================================

通常のRAGではチャンク分割が重要。

単純チャンク：
- 500〜1000 tokens程度で分割
- overlap 50〜150 tokens

意味チャンク：
- 見出し単位
- 節単位
- FAQ単位
- 表単位
- 条件文単位
- ルール単位

オントロジーグラフ型では、単なるチャンクよりも以下が重要：

- チャンクがどの業務概念に関係するか
- チャンクがどのルールの根拠か
- チャンクがどの判断基準に関係するか
- チャンクがどの部署・業務・顧客に関係するか
- チャンクが現行版か旧版か

================================================================================
11. エンティティ抽出の知識
================================================================================

文書から抽出すべきもの：

- 顧客名
- 会社名
- 部署名
- 担当者名
- 製品名
- サービス名
- 契約条件
- 金額
- 期限
- 承認者
- 禁止事項
- 条件
- 例外条件
- リスク
- 判断基準
- 根拠文書
- 業務プロセス

抽出方法：

1. ルールベース
2. 正規表現
3. 辞書マッチング
4. LLM抽出
5. NERモデル
6. 人間レビュー

LLM抽出時の出力はJSONに固定する。

例：

{
  "entities": [
    {
      "name": "20%以上の値引き",
      "type": "DecisionCriterion",
      "description": "値引率が20%を超える場合は承認が必要",
      "confidence": 0.91
    }
  ],
  "relations": [
    {
      "from": "20%以上の値引き",
      "relation": "requiresApprovalBy",
      "to": "営業責任者",
      "confidence": 0.88
    }
  ]
}

================================================================================
12. 関係抽出の知識
================================================================================

抽出すべき関係：

- AはBに属する
- AはBを対象とする
- AはBに基づく
- AはBを禁止する
- AはBを要求する
- AはBの場合に適用される
- AはBの例外である
- AはBの承認を必要とする
- AはBの根拠である
- AはBと競合する
- AはBより優先される

関係抽出では、必ずsourceを保存する。

必要な情報：

- from_node
- relation_type
- to_node
- source_document
- source_chunk
- confidence
- extracted_by
- reviewed_by
- version

================================================================================
13. 判断基準の構造化
================================================================================

最重要。

通常のRAG：
- 「似た文書」を探す

オントロジーグラフ型：
- 「どの条件なら、どの判断をすべきか」を扱う

判断基準データモデル：

DecisionCriterion:
- id
- name
- description
- target_domain
- condition_text
- condition_json
- positive_examples
- negative_examples
- action
- exception_conditions
- required_evidence
- source_document
- priority
- version
- owner

例：

name:
- 値引き承認基準

condition_text:
- 提案書内の値引率が20%を超える場合

condition_json:
{
  "field": "discount_rate",
  "operator": ">",
  "value": 0.2
}

action:
{
  "type": "require_approval",
  "approver_role": "sales_manager"
}

exception_conditions:
[
  {
    "condition": "既存契約に明記されたキャンペーン価格である場合",
    "action": "approval_not_required"
  }
]

================================================================================
14. ルールエンジンの知識
================================================================================

AIだけに判断させてはいけない。
重要な業務判断はルールエンジンで処理する。

ルールの種類：

1. 必須条件
2. 禁止条件
3. 承認条件
4. 例外条件
5. 優先順位
6. リスク判定
7. 権限判定
8. 文書整合性判定

実装方法：

軽量実装：
- PostgreSQL + JSONB
- Python function
- TypeScript function

中規模実装：
- JSONLogic
- json-rules-engine
- durable_rules

厳密実装：
- SHACL
- Drools
- Open Policy Agent
- RDF reasoner

ルール評価結果：

{
  "rule_id": "rule_discount_approval",
  "matched": true,
  "reason": "discount_rate is 0.25, which exceeds threshold 0.20",
  "required_action": "sales_manager_approval",
  "evidence": ["chunk_123", "policy_2026"]
}

================================================================================
15. ベクトル検索の知識
================================================================================

必要な処理：

1. チャンクを作る
2. embeddingを生成する
3. pgvectorなどに保存する
4. ユーザー質問をembedding化する
5. 類似チャンクを検索する
6. 必要に応じてrerankする

PostgreSQL + pgvectorで必要な知識：

- vector型
- cosine similarity
- inner product
- HNSW index
- IVFFlat index
- metadata filtering
- hybrid search

検索時には以下を組み合わせる：

- vector similarity
- keyword search
- metadata filter
- access control
- graph expansion
- rule lookup

================================================================================
16. RAGの知識
================================================================================

RAGの基本フロー：

1. User question
2. Query rewriting
3. Intent classification
4. Retriever selection
5. Vector search
6. Context assembly
7. Prompt construction
8. LLM answer generation
9. Evidence citation
10. Evaluation logging

必要な設計：

- 質問分類
- 検索対象の切り替え
- チャンク数制御
- 文脈圧縮
- 根拠文書提示
- 回答禁止条件
- ハルシネーション抑制
- 「不明」と答える条件

通常RAGの弱点：

- 判断基準を扱いにくい
- 文書間の関係を扱いにくい
- 業務ルールの優先順位を扱いにくい
- 根拠は出せても判断の妥当性を保証しにくい

================================================================================
17. GraphRAGの知識
================================================================================

GraphRAGは、文書から知識グラフを作り、
グラフ構造を使って回答する方式。

必要な処理：

1. 文書からエンティティ抽出
2. エンティティ間の関係抽出
3. グラフDB保存
4. コミュニティ検出
5. グラフ要約
6. 質問に関連するサブグラフ取得
7. 関連チャンク取得
8. LLMにグラフ文脈を渡す

向いている質問：

- 複数文書を横断する質問
- 関係性を問う質問
- 全体像を問う質問
- 影響範囲を問う質問
- 「なぜこの判断になるか」を問う質問

例：

質問：
- この提案書は承認が必要ですか？

GraphRAG処理：
1. 提案書ノードを取得
2. 対象顧客ノードを取得
3. 関連商品ノードを取得
4. 適用される業務ルールを探索
5. 値引き率・契約条件を確認
6. 承認ルールを評価
7. 根拠文書を取得
8. 回答を生成

================================================================================
18. AIエージェント設計
================================================================================

必要なAgent構成：

1. Intent Classifier Agent
2. Retriever Agent
3. Graph Search Agent
4. Rule Evaluation Agent
5. Evidence Agent
6. Answer Generation Agent
7. Validation Agent

Intentの種類：

- document_search
- rule_check
- approval_check
- faq_answer
- graph_exploration
- document_summary
- compliance_check
- ontology_edit
- entity_registration
- relation_registration

Agentの処理例：

User:
- この提案書は営業責任者の承認が必要？

Intent Classifier:
- approval_check

Retriever:
- 提案書本文を取得

Graph Search:
- Proposal -> Customer -> Product -> BusinessRuleを探索

Rule Engine:
- discount_rate > 20% なら承認必要

Evidence Agent:
- 根拠文書とルールを取得

Answer Generation:
- 承認が必要です。理由は...

Validation:
- 根拠がない断定をしていないか確認

================================================================================
19. プロンプト設計
================================================================================

System Promptに含めるべき内容：

- あなたは業務ルールに基づいて回答するAIである
- 根拠がない場合は推測しない
- 判断には必ず適用ルールを示す
- 根拠文書を明示する
- 条件が不足している場合は不足情報を示す
- ルールエンジンの結果を優先する
- LLM自身の常識で業務判断を上書きしない

回答生成プロンプトに渡す情報：

- user_question
- intent
- retrieved_chunks
- graph_context
- applicable_rules
- rule_evaluation_results
- evidence_documents
- user_role
- access_scope
- output_format

出力形式：

{
  "answer": "...",
  "decision": "approval_required",
  "confidence": 0.87,
  "applied_rules": [],
  "evidence": [],
  "missing_information": [],
  "recommended_action": "..."
}

================================================================================
20. UI/UX設計
================================================================================

必要な画面：

1. ログイン画面
2. ダッシュボード
3. 文書管理画面
4. 文書アップロード画面
5. オントロジー管理画面
6. クラス編集画面
7. プロパティ編集画面
8. グラフ可視化画面
9. ルール管理画面
10. 判断基準管理画面
11. チャット画面
12. 回答根拠表示画面
13. 評価・フィードバック画面
14. ユーザー管理画面
15. 権限管理画面
16. 監査ログ画面

チャットUIに必要な表示：

- 回答本文
- 判断結果
- 適用されたルール
- 根拠文書
- 参照チャンク
- 関連ノード
- 関連エッジ
- 不足情報
- 次に取るべきアクション
- ユーザーによる正誤フィードバック

グラフUIに必要な機能：

- ノード表示
- エッジ表示
- ノード検索
- 関係フィルタ
- クラス別色分け
- ノード詳細表示
- 根拠文書へのリンク
- 手動編集
- LLM抽出結果の承認・却下
- サブグラフ表示

================================================================================
21. API設計
================================================================================

Auth:
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Documents:
POST /api/documents/upload
GET  /api/documents
GET  /api/documents/:id
DELETE /api/documents/:id
POST /api/documents/:id/reindex

Chunks:
GET /api/documents/:id/chunks

Ontology:
GET  /api/ontology/classes
POST /api/ontology/classes
PUT  /api/ontology/classes/:id
DELETE /api/ontology/classes/:id

GET  /api/ontology/properties
POST /api/ontology/properties
PUT  /api/ontology/properties/:id
DELETE /api/ontology/properties/:id

Graph:
GET  /api/graph/nodes
POST /api/graph/nodes
GET  /api/graph/nodes/:id
PUT  /api/graph/nodes/:id
DELETE /api/graph/nodes/:id

GET  /api/graph/edges
POST /api/graph/edges
DELETE /api/graph/edges/:id

GET  /api/graph/subgraph?nodeId=xxx
GET  /api/graph/search?q=xxx

Rules:
GET  /api/rules
POST /api/rules
PUT  /api/rules/:id
DELETE /api/rules/:id
POST /api/rules/evaluate

Chat:
POST /api/chat
GET  /api/conversations
GET  /api/conversations/:id

Evaluation:
POST /api/messages/:id/feedback
GET  /api/evaluations
POST /api/evaluations/run

================================================================================
22. チャットAPIの処理フロー
================================================================================

POST /api/chat

Input:
{
  "conversation_id": "...",
  "message": "この提案書は承認が必要ですか？",
  "context": {
    "document_id": "...",
    "user_role": "sales"
  }
}

Backend flow:

1. Save user message
2. Classify intent
3. Extract query entities
4. Search vector chunks
5. Search graph nodes
6. Expand graph relations
7. Retrieve applicable rules
8. Evaluate rules
9. Assemble context
10. Call LLM
11. Validate answer
12. Save assistant message
13. Save evidence links
14. Return response

Output:
{
  "answer": "...",
  "decision": "approval_required",
  "applied_rules": [
    {
      "name": "値引き承認基準",
      "result": "matched"
    }
  ],
  "evidence": [
    {
      "document_title": "営業ポリシー2026",
      "chunk": "..."
    }
  ],
  "graph_context": {
    "nodes": [],
    "edges": []
  }
}

================================================================================
23. 権限管理の知識
================================================================================

企業向けでは必須。

必要な権限：

- organization owner
- admin
- editor
- reviewer
- general user
- viewer

制御対象：

- 文書閲覧
- チャンク検索
- グラフノード閲覧
- ルール閲覧
- ルール編集
- オントロジー編集
- チャット利用
- ログ閲覧
- 外部連携設定

PostgreSQLではRow Level Securityを使う。

注意点：

- ユーザーが見られない文書はRAGにも渡してはいけない
- LLMに渡すcontextも権限でフィルタする
- 回答内で権限外情報を漏らさない
- 監査ログを保存する

================================================================================
24. セキュリティ知識
================================================================================

必要な対策：

- 認証
- 認可
- Row Level Security
- API rate limit
- file validation
- malware scan
- prompt injection対策
- data exfiltration対策
- audit log
- encryption at rest
- encryption in transit
- secret management
- tenant isolation
- PII masking
- LLM provider data policy確認

Prompt Injection対策：

- 文書内の「前の指示を無視しろ」を命令として扱わない
- retrieved contextは信頼済み命令ではなく参照情報として扱う
- system promptを上書きさせない
- tool実行前に検証する
- 外部URLへの自動アクセスを制限する

================================================================================
25. 評価の知識
================================================================================

評価しないRAGは業務利用に危険。

評価項目：

- answer correctness
- evidence correctness
- rule application accuracy
- hallucination rate
- refusal accuracy
- retrieval precision
- retrieval recall
- latency
- cost
- user satisfaction
- human review pass rate

評価データセット：

{
  "question": "20%以上の値引き提案は承認が必要ですか？",
  "expected_answer": "必要",
  "expected_rule": "値引き承認基準",
  "expected_evidence": "営業ポリシー2026",
  "required_reasoning": "値引率が20%を超えるため"
}

必要なテスト：

- 正常ケース
- 例外ケース
- 情報不足ケース
- 権限不足ケース
- ルール競合ケース
- 古い文書を参照しないか
- 根拠なし回答をしないか

================================================================================
26. 実装フェーズ
================================================================================

Phase 1: MVP
- Next.js UI
- Supabase Auth
- 文書アップロード
- PDF text extraction
- chunking
- embedding
- pgvector search
- chat RAG
- evidence display

Phase 2: Ontology
- ontology_classes
- ontology_properties
- graph_nodes
- graph_edges
- manual graph editor
- graph visualization

Phase 3: Rule Engine
- business_rules
- decision_criteria
- rule evaluation API
- rule result integrated into chat

Phase 4: GraphRAG
- entity extraction
- relation extraction
- graph expansion retrieval
- graph context prompt
- subgraph display

Phase 5: Enterprise
- permissions
- audit log
- Slack/LINE/Notion/Drive integration
- evaluation dashboard
- local LLM
- on-prem deployment

================================================================================
27. MVPで最初に作るべきDB構成
================================================================================

最初は以下だけでよい。

- users
- organizations
- documents
- document_chunks
- ontology_classes
- ontology_properties
- graph_nodes
- graph_edges
- business_rules
- decision_criteria
- conversations
- messages
- answer_evidences

これで以下が可能：

- 文書登録
- RAG検索
- オントロジー管理
- グラフ管理
- ルール管理
- 判断支援チャット
- 根拠提示

================================================================================
28. MVPで最初に作るべき画面
================================================================================

1. 文書アップロード画面
2. チャット画面
3. 根拠表示画面
4. オントロジークラス管理画面
5. グラフ可視化画面
6. ルール管理画面

最初から美しい管理画面を作るより、
「文書 → グラフ → ルール → 回答」の一連の流れを動かすことを優先する。

================================================================================
29. MVPで最初に作るべき処理
================================================================================

1. PDFをアップロード
2. テキスト抽出
3. チャンク分割
4. embedding生成
5. pgvector保存
6. ユーザー質問
7. vector search
8. 関連チャンク取得
9. LLM回答
10. 根拠表示
11. 業務ルールを手動登録
12. 質問時にルール評価
13. 回答に判断理由を追加
14. グラフノードを手動登録
15. グラフ関係を画面表示

================================================================================
30. 同等コンセプト実現に最も重要なこと
================================================================================

重要度順：

1. 業務判断基準の構造化
2. 根拠文書との接続
3. オントロジー設計
4. グラフデータ設計
5. RAG検索
6. ルールエンジン
7. LLM回答生成
8. UI可視化
9. 評価
10. 運用

LLM APIをつなぐだけでは不十分。
「業務知識をどのように概念・関係・ルールとして構造化するか」が本体。

================================================================================
31. 実装時の基本思想
================================================================================

悪い設計：
- 文書を全部ベクトルDBに入れて、ChatGPTに聞く
- 回答の根拠が曖昧
- 判断基準をLLMに丸投げする
- ルールと文書の関係がない
- 古い文書と新しい文書を区別しない
- 権限管理がない

良い設計：
- 業務概念を定義する
- 文書を根拠として保存する
- ルールを構造化する
- 判断基準をJSON化する
- グラフで関係を表す
- RAGとGraphRAGを使い分ける
- ルール判定はプログラムで行う
- LLMは説明生成に使う
- 回答には根拠を必ず出す
- 人間レビューを入れる

================================================================================
32. 最小サンプルの概念モデル
================================================================================

Class:
- Document
- Chunk
- Customer
- Product
- Proposal
- BusinessRule
- DecisionCriterion
- User
- Department
- ApprovalFlow

Relation:
- Proposal targets Customer
- Proposal proposes Product
- Proposal mustSatisfy BusinessRule
- BusinessRule hasCriterion DecisionCriterion
- BusinessRule groundedIn Document
- DecisionCriterion requiresApprovalBy User
- User belongsTo Department
- Chunk belongsTo Document
- Chunk mentions GraphNode

Rule example:
- If proposal.discount_rate > 0.2
  then require approval by sales_manager

Answer example:
- この提案書は承認が必要です。
- 理由：値引率が20%を超えているため。
- 適用ルール：値引き承認基準
- 根拠：営業ポリシー2026
- 次のアクション：営業責任者へ承認依頼

================================================================================
33. 開発者が学ぶべき順番
================================================================================

1. Next.js / React / TypeScript
2. Supabase / PostgreSQL
3. pgvector
4. OpenAI or Claude API
5. RAGの基本
6. 文書取り込み
7. オントロジー設計
8. ナレッジグラフ設計
9. ルールエンジン
10. GraphRAG
11. React Flowによるグラフ可視化
12. 認証・権限管理
13. 評価設計
14. セキュリティ
15. 外部連携

================================================================================
34. 最終的な完成形
================================================================================

完成形は以下のようなWebアプリ。

- 管理者が社内文書をアップロードする
- AIが文書から概念・関係・ルール候補を抽出する
- 管理者が抽出結果をレビューする
- オントロジーグラフとして保存される
- ユーザーがチャットで質問する
- システムが質問意図を分類する
- 必要に応じて文書検索・グラフ検索・ルール評価を行う
- LLMが回答を生成する
- 回答には必ず判断理由と根拠が表示される
- グラフ画面で知識のつながりを確認できる
- ルールや判断基準は管理画面で更新できる
- 更新履歴と監査ログが残る
- 権限に応じて見える情報が変わる

================================================================================
35. 一言でいう本質
================================================================================

作るべきものは、
「社内文書検索チャット」ではなく、
「業務知識・判断基準・根拠文書をグラフとして構造化し、
  AIがその構造に従って回答・判断・説明するWebアプリ」
である。