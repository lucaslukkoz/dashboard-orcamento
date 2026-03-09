import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Quotation extends Model {
  declare id: number;
  declare companyId: number;
  declare clientId: number;
  declare status: 'draft' | 'sent' | 'accepted' | 'rejected';
  declare totalPrice: number;
  declare notes: string | null;
  declare validUntil: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Quotation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'accepted', 'rejected'),
      defaultValue: 'draft',
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'quotations',
    timestamps: true,
  }
);
