const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const app = express();
const port = 3000;

const SortMiddleware = require('./app/middlewares/SortMiddleware');

const route = require('./routes');
const db = require('./config/db');

db.connect();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true})); //middleware  form html
app.use(express.json()); //middleware javascript
app.use(methodOverride('_method'));
app.use(SortMiddleware); //custom middlewares
app.use(cookieParser());


// const db = {
//     user: [
//         {
//             id: 1,
//             email: "nguyenthetho@gmail.com",
//             password: "123",
//             name: "Nguyen the tho",

//         },
//     ],
// }

// const sessions = {}

//template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: require('./helpers/handlebars'),
    }),
);
app.set('view engine', 'hbs');
app.set('views', './source/resources/views');

//routes init
route(app);

// app.get('/login', (req, res) => {
//     res.render('login');
// });



// app.post('/login', (req, res) => {
//     const { email, password } = req.body;
//     const user = db.user.find((user) => user.email === email && user.password === password);
//     if (user) {
//         const sessionId = Date.now().toString();
//         sessions[sessionId] = {
//             userId: user.id,
            
//         };
//         console.log(sessions);

//         res.setHeader(
//             'Set-Cookie',
//              `sessionId=${sessionId}; HttpOnly; Max-Age=3600`
//         ).redirect('/test');
//         return;
//     } 
//     res.send('tai khoan khong ton tai');
// });

// app.get('/test', (req, res) => {
//     const session = sessions[req.cookies.sessionId];
//     if (!session) {
//         return res.redirect('/login');
//     }

//     const user = db.user.find((user) => user.id === session.userId);

//     if (!user) {
//         return res.redirect('/login');
//     }
//     res.render('test', { user });
// });

// app.get('/logout', (req, res) => {
//     delete sessions[req.cookies.sessionId];
//     res.setHeader(
//         'Set-Cookie',
//          `sessionId=; Max-Age=0`
//     ).redirect('/login');
// });




app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
