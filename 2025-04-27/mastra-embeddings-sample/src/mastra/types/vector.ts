export interface VectorItem {
  id?: number;
  embedding: number[];
  description: string;
}

export interface IVectorCrud {
  create(item: Omit<VectorItem, 'id'>): Promise<VectorItem>;
  read(id: number): Promise<VectorItem | null>;
  update(
    id: number,
    item: Partial<Omit<VectorItem, 'id'>>
  ): Promise<VectorItem | null>;
  delete(id: number): Promise<boolean>;
  searchByEmbedding(embedding: number[], topK?: number): Promise<VectorItem[]>;
}
