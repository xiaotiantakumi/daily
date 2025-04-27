import fs from 'fs';
import path from 'path';
import { PgVector } from '@mastra/pg';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { pipeline, env } from '@xenova/transformers';

// WebGPUを無効化して純粋なCPU実行モードに (Node.js環境で必要)
env.backends.onnx.wasm.numThreads = 1;

// 環境変数の読み込み
dotenv.config({ path: '.env.development' });

// 接続文字列と埋め込みモデルの設定
const connectionString =
  process.env.DATABASE_URL ||
  'postgres://dev_user:dev_password@localhost:5432/embedding_db';
// Hugging Faceモデルの指定
const embeddingModelName = 'Xenova/all-MiniLM-L6-v2';
const embeddingDimension = 384; // all-MiniLM-L6-v2の出力次元数は384

// @mastra/pgが使用するインデックス名
const INDEX_NAME = 'chunks_index';

// チャンクの型定義
interface Chunk {
  text: string;
  metadata: Record<string, any>;
}

// 初期化関数
async function initialize() {
  console.log('🚀 HTMLファイルのチャンク化と埋め込み処理を開始します...');

  // PgVectorインスタンスの作成
  const vectorStore = new PgVector(connectionString);

  try {
    // HTMLファイルの読み込みとチャンク化
    const htmlContent = await loadHtmlFile();
    const chunks = await chunkHtmlDocument(htmlContent);

    // 埋め込みベクトルの生成
    const embeddings = await generateEmbeddings(
      chunks.map((chunk) => chunk.text)
    );

    // @mastra/pgのインデックスを作成
    console.log('インデックスを作成・確認中...');
    try {
      await vectorStore.createIndex({
        indexName: INDEX_NAME,
        dimension: embeddingDimension,
        metric: 'cosine',
      });
      console.log(`インデックス "${INDEX_NAME}" を作成しました`);
    } catch (error) {
      // すでに存在する場合はエラーになるが処理は継続
      console.log(`インデックス "${INDEX_NAME}" は既に存在します`);
    }

    // チャンクとベクトルをPgVectorに保存
    await saveVectors(vectorStore, chunks, embeddings);

    console.log('✅ 処理が完了しました。');

    // 接続を閉じる
    await vectorStore.disconnect();
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    await vectorStore.disconnect();
  }
}

// HTMLファイルの読み込み
async function loadHtmlFile(): Promise<string> {
  console.log('HTMLファイルを読み込み中...');
  const htmlPath = path.join(process.cwd(), 'input_data', 'sample.html');
  return fs.readFileSync(htmlPath, 'utf-8');
}

// HTMLドキュメントのチャンク化
async function chunkHtmlDocument(htmlContent: string): Promise<Chunk[]> {
  console.log('HTMLドキュメントをチャンク化中...');

  // HTMLの簡易パース
  const chunks: Chunk[] = [];

  // ヘッダーなどのタグを抽出するための正規表現
  const headerRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi;
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;

  // テキストの抽出とクリーニング
  const cleanHtml = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // スクリプトタグの削除
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // スタイルタグの削除
    .replace(/<[^>]+>/g, ' ') // タグの削除
    .replace(/\s+/g, ' ') // 連続した空白の削除
    .trim();

  // テキストをチャンクに分割（約500文字ごと）
  const chunkSize = 500;
  const overlap = 100;

  let startIdx = 0;
  while (startIdx < cleanHtml.length) {
    const endIdx = Math.min(startIdx + chunkSize, cleanHtml.length);
    const chunkText = cleanHtml.substring(startIdx, endIdx);

    chunks.push({
      text: chunkText,
      metadata: {
        chunkIndex: chunks.length,
        source: 'sample.html',
        startChar: startIdx,
        endChar: endIdx,
        title: 'pgvectorとDockerでベクトルデータベースの実験環境構築',
        url: 'https://takumi-oda.com/blog/2025/04/27/post-4500/',
      },
    });

    startIdx += chunkSize - overlap;
  }

  console.log(`HTMLドキュメントを${chunks.length}個のチャンクに分割しました。`);
  return chunks;
}

// 埋め込みベクトルの生成（Hugging Faceモデルを使用）
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  console.log('埋め込みベクトルを生成中...');
  console.log(`モデル: ${embeddingModelName}`);

  // Hugging Faceのモデルをロード
  const embedder = await pipeline('feature-extraction', embeddingModelName);

  // バッチサイズ
  const batchSize = 16;
  const embeddings: number[][] = [];

  // バッチ処理
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(
      `バッチ処理中: ${i + 1} 〜 ${Math.min(i + batchSize, texts.length)} / ${texts.length}`
    );

    // バッチの埋め込みを生成
    const batchResults = await Promise.all(
      batch.map(async (text) => {
        const result = await embedder(text, {
          pooling: 'mean',
          normalize: true,
        });
        return Array.from(result.data);
      })
    );

    embeddings.push(...batchResults);
  }

  console.log(
    `${embeddings.length}個のテキストに対して埋め込みベクトルを生成しました。`
  );
  return embeddings;
}

// ベクトルの保存
async function saveVectors(
  vectorStore: PgVector,
  chunks: Chunk[],
  embeddings: number[][]
) {
  console.log('ベクトルをデータベースに保存中...');

  // データベース接続プール（SQL直接実行用）
  const pool = new Pool({ connectionString });

  try {
    // バッチサイズ
    const batchSize = 20;
    let processed = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));
      const batchEmbeddings = embeddings.slice(
        i,
        Math.min(i + batchSize, embeddings.length)
      );

      // データベースに直接挿入（PgVectorのAPIではなく）
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const embedding = batchEmbeddings[j];
        const vector_id = `chunk_${processed + j + 1}`;

        // PostgreSQLに直接挿入
        await pool.query(
          `INSERT INTO ${INDEX_NAME} (vector_id, embedding, metadata)
           VALUES ($1, $2, $3)`,
          [
            vector_id,
            `[${embedding.join(',')}]`,
            JSON.stringify({
              content: chunk.text,
              ...chunk.metadata,
            }),
          ]
        );
      }

      processed += batch.length;
      console.log(`処理済み: ${processed}/${chunks.length}`);
    }

    console.log(`${processed}個のベクトルを保存しました。`);
  } finally {
    // 接続を閉じる
    await pool.end();
  }
}

// プログラムの実行
initialize().catch((error) => {
  console.error('プログラム実行中にエラーが発生しました:', error);
  process.exit(1);
});
