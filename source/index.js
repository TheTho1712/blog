const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;

const route = require('./routes');
const db = require('./config/db');

db.connect();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded()); //middleware  form html
app.use(express.json()); //middleware javascript

//HTTP logger
// app.use(morgan('combined'));

//template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
    }),
);
app.set('view engine', 'hbs');
app.set('views', './source/resources/views');
// app.set('views', path.join(__dirname, 'resourses', 'views'));

route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
