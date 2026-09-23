const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: [env.CLIENT_URL, env.ADMIN_URL].filter(Boolean) }));
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Pehenlo API is running' });
});

app.use('/api/v1', routes);

app.use(errorMiddleware);

module.exports = app;
