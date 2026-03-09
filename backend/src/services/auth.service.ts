import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (companyId: number): string => {
  return jwt.sign({ companyId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as string | number,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): { companyId: number } => {
  return jwt.verify(token, env.jwt.secret) as { companyId: number };
};
