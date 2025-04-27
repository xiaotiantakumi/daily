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

// 既存のテーブル名
const DOCUMENT_TABLE = 'documents';
const CHUNK_TABLE = 'chunks';

// 新しいインデックス名（@mastra/pgが使用する）
const NEW_INDEX_NAME = 'chunks_index';

async function migrateToMastraFormat() {
  console.log('🚀 データを@mastra/pg形式に移行します...');

  // PostgreSQLへの接続
  const pool = new Pool({ connectionString });

  // PgVectorインスタンスの作成
  const vectorStore = new PgVector(connectionString);

  try {
    // 既存のデータの取得
    console.log('1. 既存のデータを取得中...');
    const { rows: chunks } = await pool.query(`
      SELECT c.id, c.document_id, c.content, c.embedding, c.metadata, d.title 
      FROM ${CHUNK_TABLE} c
      JOIN ${DOCUMENT_TABLE} d ON c.document_id = d.id
    `);

    console.log(`${chunks.length}件のチャンクを取得しました`);

    // @mastra/pgのインデックスを作成
    console.log('2. @mastra/pgのインデックスを作成中...');
    await vectorStore.createIndex({
      indexName: NEW_INDEX_NAME,
      dimension: 384, // all-MiniLM-L6-v2の出力次元数
      metric: 'cosine',
    });

    // データを@mastra/pg形式に変換してインサート
    console.log('3. データを@mastra/pg形式に変換してインサート中...');

    // バッチ処理用の配列
    const batchSize = 20;
    let processed = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));

      // バッチ内のデータを処理
      const vectors: number[][] = [];
      const metadata: Record<string, any>[] = [];
      const ids: string[] = [];

      batch.forEach((chunk) => {
        // 文字列形式の埋め込みベクトルを配列に変換
        // '[0.1,0.2,0.3]' -> [0.1, 0.2, 0.3]
        const embeddingStr = chunk.embedding;
        const embedding = JSON.parse(embeddingStr.replace(/^\[|\]$/g, ''));

        vectors.push(embedding);
        ids.push(chunk.id.toString());
        metadata.push({
          content: chunk.content,
          documentId: chunk.document_id,
          originalId: chunk.id,
          documentTitle: chunk.title,
          ...(typeof chunk.metadata === 'string'
            ? JSON.parse(chunk.metadata)
            : chunk.metadata),
        });
      });

      // @mastra/pgにupsert
      await vectorStore.upsert({
        indexName: NEW_INDEX_NAME,
        vectors,
        metadata,
        ids,
      });

      processed += batch.length;
      console.log(`処理済み: ${processed}/${chunks.length}`);
    }

    console.log('✅ @mastra/pg形式への移行が完了しました');
    console.log(`インデックス名: ${NEW_INDEX_NAME}`);

    // 接続を閉じる
    await pool.end();
    await vectorStore.disconnect();
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    await pool.end();
    await vectorStore.disconnect();
  }
}

// プログラムの実行
migrateToMastraFormat().catch((error) => {
  console.error('プログラム実行中にエラーが発生しました:', error);
  process.exit(1);
});
