import app from './app';
import { env } from './config/env';
import sequelize from './config/database';

// Import models to register associations
import './models';

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync();
    console.log('Database synced.');

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
