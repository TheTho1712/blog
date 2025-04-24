const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const app = express();
const port = 3000;

const route = require('./routes');
const db = require('./config/db');

db.connect();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true})); //middleware  form html
app.use(express.json()); //middleware javascript

//HTTP logger
// app.use(morgan('combined'));

//template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: {
            sum: (a, b) => a + b,
        },
    }),
);
app.set('view engine', 'hbs');
app.set('views', './source/resources/views');
// app.set('views', path.join(__dirname, 'resourses', 'views'));

app.use(methodOverride('_method'));

//routes init
route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
