# Ontology Graph App

PDFまたはHTMLから本文を抽出し、概念・エンティティ・関係をグラフ化してWeb UIで確認・編集するMVPです。

<img width="1702" height="1028" alt="image" src="https://github.com/user-attachments/assets/6024a5cb-6151-43b0-a6db-2392dea996d8" />


## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで `http://127.0.0.1:3000` を開きます。

## サンプルJSON

POC用のサンプルグラフJSONは `docs/sample/53_20224514_graph_curated.json` にあります。

## LLM設定

`.env.local` に `OPENAI_API_KEY` を設定すると、OpenAI APIでノード・エッジ抽出を行います。未設定の場合は、ローカルのルールベース抽出で暫定グラフを生成します。

## 保存方式

現在のMVPはローカル開発を優先し、`data/store.json` に文書、チャンク、ノード、エッジ、ジョブ履歴を保存します。PostgreSQL / Supabaseへ移行するための初期スキーマは `supabase/migrations/001_initial_schema.sql` にあります。

## 主要機能

- PDFアップロード
- HTML URL取り込み
- HTMLファイルアップロード
- テキスト抽出・整形
- チャンク分割
- LLMまたはローカル抽出によるグラフ生成
- React Flowによるノード・エッジ表示
- ノード・エッジ詳細と根拠チャンク表示
- ノード・エッジ編集
- ノード・エッジ削除

## 検証コマンド

```bash
npm run typecheck
npm run build
```
