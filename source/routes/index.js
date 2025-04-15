const newsRouter = require('./news');
const dishesRouter = require('./dishes');

const siteRouter = require('./site');

function route(app) {
    app.use('/news', newsRouter);
    app.use('/dishes', dishesRouter);

    app.use('/', siteRouter);

    // app.get('/', (req, res) => {
    //     res.render('home');
    //   });

    //   app.get('/search', (req, res) => {
    //     // console.log(req.query.q);
    //     res.render('search');
    //   });

    //   app.post('/search', (req, res) => {
    //     console.log(req.body);
    //     res.render('search');
    //   })

    //   app.get('/register', (req, res) => {
    //     res.render('test register');
    //   })

    //   app.post('/register', (req, res) => {
    //     console.log(req.body);
    //     res.render('test register');
    //   })
}

module.exports = route;
