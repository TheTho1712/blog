const Dish = require('../models/Dish');
const { multipleMongooseToObject } = require('../../util/mongoose');

class SiteController {
    index(req, res, next) {
        Dish.find({})
            .then((dishes) => {
                res.render('home', {
                    dishes: multipleMongooseToObject(dishes),
                });
            })
            .catch(next);
    }

    //GET /search
    search(req, res) {
        res.render('search');
    }

    //GET /register
    register(req, res) {
        res.render('testregister');
    }

    //GET /introduce
    introduce(req, res) {
        res.render('introduce');
    }

    login(req, res) {
        res.render('login');
    }
}

module.exports = new SiteController();
