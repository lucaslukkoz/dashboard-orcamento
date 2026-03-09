import { Request, Response } from 'express';
import { Client, Quotation } from '../models';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, address } = req.body;

  if (!name) {
    throw new ApiError(400, 'Client name is required');
  }

  const client = await Client.create({
    companyId: req.companyId!,
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
  });

  res.status(201).json(client);
});

export const findAll = asyncHandler(async (req: Request, res: Response) => {
  const clients = await Client.findAll({
    where: { companyId: req.companyId! },
    order: [['createdAt', 'DESC']],
  });

  res.json(clients);
});

export const findById = asyncHandler(async (req: Request, res: Response) => {
  const client = await Client.findOne({
    where: { id: req.params.id, companyId: req.companyId! },
  });

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  res.json(client);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const client = await Client.findOne({
    where: { id: req.params.id, companyId: req.companyId! },
  });

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  const { name, email, phone, address } = req.body;
  await client.update({ name, email, phone, address });

  res.json(client);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const client = await Client.findOne({
    where: { id: req.params.id, companyId: req.companyId! },
  });

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  const quotationCount = await Quotation.count({ where: { clientId: client.id } });
  if (quotationCount > 0) {
    throw new ApiError(400, `Cannot delete client with ${quotationCount} existing quotation(s). Delete the quotations first.`);
  }

  await client.destroy();
  res.json({ message: 'Client deleted successfully' });
});
