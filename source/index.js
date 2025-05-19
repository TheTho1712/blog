require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;
const Handlebars = require('handlebars');
const {
    allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');

const SortMiddleware = require('./app/middlewares/SortMiddleware');

const route = require('./routes');
const db = require('./config/db');
const mongoose = require('./util/mongoose');

db.connect();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); //middleware  form html
app.use(express.json()); //middleware javascript
app.use(methodOverride('_method'));
app.use(SortMiddleware); //custom middlewares
app.use(cookieParser());

app.use(
    session({
        secret: [process.env.SESSION_SECRET || 'fallback_secret_key'],
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 3600000 },
    }),
    
);

//template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        helpers: require('./helpers/handlebars'),
    }),
);
app.set('view engine', 'hbs');
app.set('views', './source/resources/views');
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

//routes init
route(app);

const User = require('./app/models/User');

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
