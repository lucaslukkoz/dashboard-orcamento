import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import quotationRoutes from './quotation.routes';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/clients', authMiddleware, clientRoutes);
router.use('/quotations', authMiddleware, quotationRoutes);

export default router;
