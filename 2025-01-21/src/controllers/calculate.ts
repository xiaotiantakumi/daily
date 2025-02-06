import { Request, Response, NextFunction } from 'express';
import { calculateProfitLoss } from '../services/calculation';
import { Municipality } from '../models/municipality';

interface CalculateRequest {
  donationAmount: number;
  giftValue: number;
  municipalityId: string;
}

export const calculate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { donationAmount, giftValue, municipalityId } = req.body as CalculateRequest;

    // TODO: 実際の自治体データ取得処理を実装
    const municipality: Municipality = {
      id: municipalityId,
      name: 'Sample Municipality',
      prefecture: 'Tokyo',
      taxDeductionRate: 0.2,
      giftValueRate: 0.1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = calculateProfitLoss({
      donationAmount,
      giftValue,
      municipality,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};
