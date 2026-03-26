const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const hpp = require('hpp');
const morgan = require('morgan');
const methodOverride = require('method-override');
const { attachUserToRequest, attachLocals } = require('./middlewares/authMiddleware');
const { sanitizeRequest } = require('./middlewares/sanitizeMiddleware');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const routes = require('./routes');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(hpp());
app.use(sanitizeRequest);
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use(attachUserToRequest);
app.use(attachLocals);
app.use(routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
