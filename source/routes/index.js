const newsRouter = require('./news');
const meRouter = require('./me');
const dishesRouter = require('./dishes');
const siteRouter = require('./site');
const profileRouter = require('./profile');
const { profile } = require('../app/controllers/SiteController');

function route(app) {
    app.use('/news', newsRouter);
    app.use('/me', meRouter);
    app.use('/dishes', dishesRouter);
    app.use('/', profileRouter);
    app.use('/', siteRouter);
}

module.exports = route;
