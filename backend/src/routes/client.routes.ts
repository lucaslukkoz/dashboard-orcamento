import { Router } from 'express';
import * as clientController from '../controllers/client.controller';

const router = Router();

router.post('/', clientController.create);
router.get('/', clientController.findAll);
router.get('/:id', clientController.findById);
router.put('/:id', clientController.update);
router.delete('/:id', clientController.remove);

export default router;
