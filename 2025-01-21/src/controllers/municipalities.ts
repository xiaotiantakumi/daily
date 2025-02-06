import { Request, Response } from 'express';
import { Municipality } from '../models/municipality';

export const getMunicipalities = async (_req: Request, res: Response) => {
  try {
    // TODO: 実際のデータ取得処理を実装
    const municipalities: Municipality[] = [];
    res.json(municipalities);
  } catch (error) {
    res.status(500).json({ message: '自治体一覧の取得に失敗しました' });
  }
};

export const getMunicipalityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(id);
    // TODO: 実際のデータ取得処理を実装
    const municipality: Municipality | null = null;
    res.json(municipality);
  } catch (error) {
    res.status(500).json({ message: '自治体情報の取得に失敗しました' });
  }
};
