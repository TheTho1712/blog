const Dish = require('../models/Dish');
const { multipleMongooseToObject } = require('../../util/mongoose');

class MeController {

    //GET /me/stored/dishes
    storedDishes(req, res, next) {
        Dish.find({})
            .then(dishes => res.render('me/stored-dishes', {
                dishes: multipleMongooseToObject(dishes)
            }))
            .catch(next);
        
    }


}

module.exports = new MeController();
