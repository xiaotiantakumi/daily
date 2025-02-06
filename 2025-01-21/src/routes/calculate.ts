import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import type { Result } from 'express-validator';
import { AppError } from '../middleware/errorHandler';
import { calculate } from '../controllers/calculate';

const router = Router();

router.post(
  '/',
  [
    body('donationAmount').isNumeric().withMessage('寄付金額は数値で入力してください'),
    body('giftValue').isNumeric().withMessage('返礼品価値は数値で入力してください'),
    body('municipalityId').isString().withMessage('自治体IDは文字列で入力してください'),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors: Result = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('入力値が不正です', 400));
    }

    calculate(req, res, next);
  },
);

export { router as calculateRouter };
