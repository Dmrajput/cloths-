require('dotenv').config();

const env = require('./src/config/env');
env.assertSecureConfig();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

connectDB();

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} (${env.NODE_ENV})`);
});
