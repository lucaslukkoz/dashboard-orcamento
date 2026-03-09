import { Request, Response } from 'express';
import { PassThrough } from 'stream';
import { Quotation, QuotationItem, Client, Company } from '../models';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateQuotationPdf } from '../services/pdf.service';
import { sendQuotationEmail } from '../services/email.service';
import sequelize from '../config/database';

const VALID_STATUSES = ['draft', 'sent', 'accepted', 'rejected'];

function validateItems(items: any[]): { description: string; quantity: number; unitPrice: number; totalPrice: number }[] {
  return items.map((item: any, index: number) => {
    if (!item.description || typeof item.description !== 'string' || item.description.trim() === '') {
      throw new ApiError(400, `Item ${index + 1}: description is required`);
    }
    const quantity = Number(item.quantity) || 0;
    if (quantity <= 0) {
      throw new ApiError(400, `Item ${index + 1}: quantity must be greater than 0`);
    }
    const unitPrice = Number(item.unitPrice);
    if (isNaN(unitPrice) || unitPrice < 0) {
      throw new ApiError(400, `Item ${index + 1}: unitPrice must be a valid non-negative number`);
    }
    return {
      description: item.description.trim(),
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    };
  });
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { clientId, notes, validUntil, items } = req.body;

  if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'clientId and at least one item are required');
  }

  // Verify client belongs to this company
  const client = await Client.findOne({
    where: { id: clientId, companyId: req.companyId! },
  });
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  const result = await sequelize.transaction(async (t) => {
    const processedItems = validateItems(items);
    const totalPrice = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const quotation = await Quotation.create(
      {
        companyId: req.companyId!,
        clientId,
        notes: notes || null,
        validUntil: validUntil || null,
        totalPrice,
      },
      { transaction: t }
    );

    const quotationItems = await QuotationItem.bulkCreate(
      processedItems.map((item: any) => ({
        ...item,
        quotationId: quotation.id,
      })),
      { transaction: t }
    );

    return { quotation, items: quotationItems };
  });

  res.status(201).json(result);
});

export const findAll = asyncHandler(async (req: Request, res: Response) => {
  const quotations = await Quotation.findAll({
    where: { companyId: req.companyId! },
    include: [{ model: Client, as: 'client', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
  });

  res.json(quotations);
});

export const findById = asyncHandler(async (req: Request, res: Response) => {
  const quotation = await Quotation.findOne({
    where: { id: req.params.id, companyId: req.companyId! },
    include: [
      { model: Client, as: 'client' },
      { model: QuotationItem, as: 'items' },
    ],
  });

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  res.json(quotation);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { clientId, notes, validUntil, status, items } = req.body;

  const quotation = await Quotation.findOne({
    where: { id: req.params.id, companyId: req.companyId! },
  });

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  // If changing client, verify ownership
  if (clientId) {
    const client = await Client.findOne({
      where: { id: clientId, companyId: req.companyId! },
    });
    if (!client) {
      throw new ApiError(404, 'Client not found');
    }
  }

  await sequelize.transaction(async (t) => {
    // If items are provided, replace them
    if (items && Array.isArray(items)) {
      await QuotationItem.destroy({ where: { quotationId: quotation.id }, transaction: t });

      const processedItems = validateItems(items).map((item) => ({
        ...item,
        quotationId: quotation.id,
      }));

      const totalPrice = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

      await QuotationItem.bulkCreate(processedItems, { transaction: t });
      await quotation.update(
        { clientId, notes, validUntil, status, totalPrice },
        { transaction: t }
      );
    } else {
      await quotation.update({ clientId, notes, validUntil, status }, { transaction: t });
    }
  });

  // Return updated quotation with relations
  const updated = await Quotation.findOne({
    where: { id: quotation.id },
    include: [
      { model: Client, as: 'client' },
      { model: QuotationItem, as: 'items' },
    ],
  });

  res.json(updated);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const quotation = await Quotation.findOne({
    where: { id: req.params.id, companyId: req.companyId! },
  });

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  await sequelize.transaction(async (t) => {
    await QuotationItem.destroy({ where: { quotationId: quotation.id }, transaction: t });
    await quotation.destroy({ transaction: t });
  });

  res.json({ message: 'Quotation deleted successfully' });
});

export const exportPdf = asyncHandler(async (req: Request, res: Response) => {
  const quotation = await Quotation.findOne({
    where: { id: req.params.id, companyId: req.companyId! },
    include: [
      { model: Client, as: 'client' },
      { model: Company, as: 'company' },
      { model: QuotationItem, as: 'items' },
    ],
  });

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=quotation-${quotation.id}.pdf`);

  const doc = generateQuotationPdf(quotation as any);
  doc.pipe(res);
});

export const send = asyncHandler(async (req: Request, res: Response) => {
  const quotation = await Quotation.findOne({
    where: { id: req.params.id, companyId: req.companyId! },
    include: [
      { model: Client, as: 'client' },
      { model: Company, as: 'company' },
      { model: QuotationItem, as: 'items' },
    ],
  });

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  const client = (quotation as any).client as Client;
  if (!client.email) {
    throw new ApiError(400, 'Client does not have an email address');
  }

  // Generate PDF buffer
  const doc = generateQuotationPdf(quotation as any);
  const passThrough = new PassThrough();
  doc.pipe(passThrough);

  const chunks: Buffer[] = [];
  for await (const chunk of passThrough) {
    chunks.push(chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);

  // Send email
  try {
    await sendQuotationEmail({
      to: client.email,
      companyName: (quotation as any).company.name,
      quotationId: quotation.id,
      pdfBuffer,
    });
  } catch {
    throw new ApiError(500, 'Failed to send email. Please check your SMTP configuration.');
  }

  // Update status to sent only after email succeeds
  await quotation.update({ status: 'sent' });

  res.json({ message: 'Quotation sent successfully' });
});
