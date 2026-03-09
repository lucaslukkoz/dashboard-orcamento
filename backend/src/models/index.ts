import { Company } from './Company';
import { Client } from './Client';
import { Quotation } from './Quotation';
import { QuotationItem } from './QuotationItem';

// Company -> Clients
Company.hasMany(Client, { foreignKey: 'companyId', as: 'clients' });
Client.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Company -> Quotations
Company.hasMany(Quotation, { foreignKey: 'companyId', as: 'quotations' });
Quotation.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Client -> Quotations
Client.hasMany(Quotation, { foreignKey: 'clientId', as: 'quotations' });
Quotation.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Quotation -> QuotationItems
Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId', as: 'items' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });

export { Company, Client, Quotation, QuotationItem };
