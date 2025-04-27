import { PgVector } from '@mastra/pg';
import dotenv from 'dotenv';
import readline from 'readline';
import { pipeline, env } from '@xenova/transformers';
import { Pool } from 'pg';

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

// 検索結果の型定義
interface SearchResult {
  id: string;
  score: number;
  content?: string;
  metadata?: Record<string, any>;
}

// PgVectorインスタンスの作成
const vectorStore = new PgVector(connectionString);

// 検索用のreadlineインターフェースの作成
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ベクトル類似度検索の実装
async function searchSimilarChunks(
  queryText: string,
  limit: number = 5
): Promise<SearchResult[]> {
  console.log(`"${queryText}"に類似する内容を検索中...`);
  console.log(`モデル: ${embeddingModelName}`);

  // Hugging Faceのモデルをロード
  const embedder = await pipeline('feature-extraction', embeddingModelName);

  // 検索クエリの埋め込みベクトルを生成
  const result = await embedder(queryText, {
    pooling: 'mean',
    normalize: true,
  });
  const queryVector = Array.from(result.data);

  // PgVectorを使用して検索
  const vectorResults = await vectorStore.query({
    indexName: INDEX_NAME,
    queryVector: queryVector,
    topK: limit,
  });

  // 結果をフォーマット
  return vectorResults.map((result) => {
    return {
      id: result.id,
      score: result.score,
      content: result.metadata?.content,
      metadata: result.metadata,
    };
  });
}

// 検索結果の表示
async function displaySearchResults(queryText: string, limit: number = 5) {
  try {
    // 類似度検索を実行
    const results = await searchSimilarChunks(queryText, limit);

    console.log(`\n"${queryText}" の検索結果（${results.length}件）:`);
    console.log('-----------------------------------------------------');

    // 結果を表示
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(`\n[${i + 1}] スコア: ${result.score.toFixed(4)}`);

      // コンテンツの表示（存在する場合）
      if (result.content) {
        console.log(`内容: ${result.content.substring(0, 150)}...`);
      } else {
        console.log('内容: [コンテンツが見つかりません]');
      }

      // メタデータの表示（存在する場合）
      if (result.metadata) {
        try {
          if (result.metadata.chunkIndex !== undefined) {
            console.log(`チャンクインデックス: ${result.metadata.chunkIndex}`);
          }
          if (result.metadata.title) {
            console.log(`ドキュメント: ${result.metadata.title}`);
          }
        } catch (error) {
          console.log('メタデータ: [パースエラー]');
        }
      }

      console.log('-----------------------------------------------------');
    }
  } catch (error) {
    console.error('検索中にエラーが発生しました:', error);
  }
}

// 対話的な検索の実装
async function interactiveSearch() {
  console.log('🔍 ベクトル検索デモ');
  console.log('「exit」または「quit」と入力すると終了します。\n');

  const askQuestion = () => {
    rl.question('検索クエリを入力してください: ', async (query) => {
      if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
        console.log('検索を終了します。');
        rl.close();
        await vectorStore.disconnect();
        return;
      }

      await displaySearchResults(query);
      askQuestion();
    });
  };

  askQuestion();
}

// プログラムの実行
interactiveSearch().catch((error) => {
  console.error('プログラム実行中にエラーが発生しました:', error);
  rl.close();
  vectorStore.disconnect().then(() => process.exit(1));
});
