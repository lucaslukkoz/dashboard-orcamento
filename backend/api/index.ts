import app from '../src/app';
import sequelize from '../src/config/database';
import '../src/models';

let isDbInitialized = false;

const initDb = async () => {
  if (!isDbInitialized) {
    await sequelize.authenticate();
    await sequelize.sync();
    isDbInitialized = true;
  }
};

export default async (req: any, res: any) => {
  await initDb();
  return app(req, res);
};
