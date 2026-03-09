import { Router } from 'express';
import * as quotationController from '../controllers/quotation.controller';

const router = Router();

router.post('/', quotationController.create);
router.get('/', quotationController.findAll);
router.get('/:id/pdf', quotationController.exportPdf);
router.post('/:id/send', quotationController.send);
router.get('/:id', quotationController.findById);
router.put('/:id', quotationController.update);
router.delete('/:id', quotationController.remove);

export default router;
