import { PgVector } from '@mastra/pg';
import { IVectorCrud, VectorItem } from '../types/vector';

// PgVectorインスタンスを作成（接続文字列は.envなどで管理）
const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING as string);
// ベクトルデータのインデックス名（pgvectorのテーブル名のようなもの）
const INDEX_NAME = 'embeddings';

// descriptionやidは本来DBや別テーブルで管理するのが理想ですが、
// このサンプルでは簡易的にMapで管理します
const descriptionMap = new Map<string, string>();

/**
 * PgVectorを使ったベクトルデータのCRUDサンプル実装
 * ※ 本格的な運用ではPostgreSQLのテーブル設計やメタデータ管理が必要です
 */
export class MastraVectorCrud implements IVectorCrud {
  /**
   * ベクトルデータを新規追加する
   * @param item 追加するベクトルと説明
   * @returns 追加したベクトル情報（idは未設定）
   */
  async create(item: Omit<VectorItem, 'id'>): Promise<VectorItem> {
    // vectorsはnumber[]の配列（複数件同時追加も可能）
    const vectors = [item.embedding];
    await pgVector.upsert({
      indexName: 'items',
      vectors: [
        {
          vector: vectors,
          metadata: { id: undefined, description: item.description },
        },
      ],
    });
    // idは自動生成される場合が多いので、ここではundefined
    // descriptionはMapで管理（本来はDBで一元管理すべき）
    // descriptionMap.set(id, item.description); // idが分かる場合はこうする
    return { embedding: item.embedding, description: item.description };
  }

  /**
   * idでベクトルデータを取得する（未実装）
   * @param id 取得したいベクトルのid
   * @returns ベクトル情報 or null
   */
  async read(id: number): Promise<VectorItem | null> {
    // idで直接取得するAPIは現状ないため未実装
    // 本格運用ではidとembedding/descriptionをDBで紐付けて管理する
    return null;
  }

  /**
   * idでベクトルデータを更新する（未実装）
   * @param id 更新したいベクトルのid
   * @param item 更新内容
   * @returns 更新後のベクトル情報 or null
   */
  async update(
    id: number,
    item: Partial<Omit<VectorItem, 'id'>>
  ): Promise<VectorItem | null> {
    // idで直接更新するAPIは現状ないため未実装
    // 本格運用ではidとembedding/descriptionをDBで紐付けて管理し、upsertで上書きする
    return null;
  }

  /**
   * idでベクトルデータを削除する（未実装）
   * @param id 削除したいベクトルのid
   * @returns 削除成功ならtrue
   */
  async delete(id: number): Promise<boolean> {
    // PgVectorにdelete APIは現状ないため未実装
    // 本格運用ではDB側で論理削除や物理削除を実装する
    return false;
  }

  /**
   * 類似ベクトル検索（コサイン類似度など）
   * @param embedding 検索したいベクトル
   * @param topK 上位何件まで返すか
   * @returns 類似度の高いベクトルリスト
   */
  async searchByEmbedding(
    embedding: number[],
    topK: number = 5
  ): Promise<VectorItem[]> {
    // queryVectorに検索したいベクトルを渡す
    // topKで返す件数を指定
    const results = await pgVector.query({
      indexName: INDEX_NAME,
      queryVector: embedding,
      topK,
    });
    // descriptionはMapから取得（本来はDB管理）
    // doc.embedding: ベクトル本体, doc.id: ベクトルID
    return results.map((doc: any) => ({
      id: doc.id,
      embedding: doc.embedding,
      description: descriptionMap.get(doc.id) || '',
    }));
  }
}
