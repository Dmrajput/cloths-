const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigins = [env.CLIENT_URL, env.ADMIN_URL].filter(Boolean);

app.set('trust proxy', 1);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Pehenlo API is running' });
});

app.use('/api/v1', routes);

app.use(errorMiddleware);

module.exports = app;
