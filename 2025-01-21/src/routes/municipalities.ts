import express from 'express';
import { getMunicipalities, getMunicipalityById } from '../controllers/municipalities';

const router = express.Router();

router.get('/', getMunicipalities);
router.get('/:id', getMunicipalityById);

export default router;
