import { Request, Response } from 'express';
import { Company } from '../models';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const existing = await Company.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'A company with this email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const company = await Company.create({
    name,
    email,
    password: hashedPassword,
    phone: phone || null,
    address: address || null,
  });

  const token = generateToken(company.id);

  res.status(201).json({
    company: {
      id: company.id,
      name: company.name,
      email: company.email,
    },
    token,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const company = await (Company as any).scope('withPassword').findOne({ where: { email } });
  if (!company) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isValid = await comparePassword(password, company.password);
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(company.id);

  res.json({
    company: {
      id: company.id,
      name: company.name,
      email: company.email,
    },
    token,
  });
});
