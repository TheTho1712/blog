const meRouter = require('./me');
const dishesRouter = require('./dishes');
const siteRouter = require('./site');
const profileRouter = require('./profile');
const adminRouter = require('./admin');
const { profile } = require('../app/controllers/SiteController');

const userAuth = require('../app/middlewares/userAuth');
const adminAuth = require('../app/middlewares/adminAuth');

function route(app) {
    app.use('/me', meRouter);
    app.use('/dishes', userAuth, dishesRouter);
    app.use('/admin', adminAuth, adminRouter);
    app.use('/', profileRouter);
    app.use('/', siteRouter);
}

module.exports = route;
