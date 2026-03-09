import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class QuotationItem extends Model {
  declare id: number;
  declare quotationId: number;
  declare description: string;
  declare quantity: number;
  declare unitPrice: number;
  declare totalPrice: number;
}

QuotationItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quotationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'quotation_items',
    timestamps: true,
  }
);
