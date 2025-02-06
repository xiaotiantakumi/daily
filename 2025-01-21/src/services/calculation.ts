import { Municipality } from '../models/municipality';

interface CalculationInput {
  donationAmount: number;
  giftValue: number;
  municipality: Municipality;
}

interface CalculationResult {
  taxDeduction: number;
  netCost: number;
  effectiveRate: number;
}

export const calculateProfitLoss = (input: CalculationInput): CalculationResult => {
  const { donationAmount, giftValue, municipality } = input;

  // 住民税控除額 = 寄付金額 × 控除率
  const taxDeduction = donationAmount * municipality.taxDeductionRate;

  // 実質負担額 = 寄付金額 - 住民税控除額 - 返礼品価値
  const netCost = donationAmount - taxDeduction - giftValue;

  // 実質負担率 = 実質負担額 / 寄付金額
  const effectiveRate = netCost / donationAmount;

  return {
    taxDeduction,
    netCost,
    effectiveRate,
  };
};
