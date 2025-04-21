const newsRouter = require('./news');
const meRouter = require('./me');
const dishesRouter = require('./dishes');
const siteRouter = require('./site');

function route(app) {
    
    app.use('/news', newsRouter);
    app.use('/me', meRouter);
    app.use('/dishes', dishesRouter);
    app.use('/', siteRouter);

}

module.exports = route;
