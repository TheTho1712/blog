const Dish = require('../models/Dish');
const { multipleMongooseToObject } = require('../../util/mongoose');

class SiteController {
    // GET /
    // async index(req, res) {

    //     const dishes = await Dish.find({});
    //     res.render(dishes);
    //     // res.render('home');
    // }

    index(req, res, next) {
        Dish.find({})
            .then((dishes) => {
                res.render('home', {
                    dishes: multipleMongooseToObject(dishes),
                });
            })
            .catch(next);
    }

    // index(req, res, next) {
    //     Dish.find({}, function(err, dishes){
    //         if(!err) {
    //             res.json(dishes);
    //         } else {
    //             next(err);
    //             // res.status(400).json({ error: 'error'})
    //         }
    //     })
    // }

    //GET /search
    search(req, res) {
        res.render('search');
    }

    register(req, res) {
        res.render('testregister');
    }

    introduce(req, res) {
        res.render('introduce');
    }

}

module.exports = new SiteController();
