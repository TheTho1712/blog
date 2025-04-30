const Dish = require('../models/Dish');
const { multipleMongooseToObject } = require('../../util/mongoose');
const User = require('../models/User');

class MeController {
    //GET /me/stored/dishes
    storedDishes(req, res, next) {
        const { column, type } = req.query;

        Promise.all([
            Dish.find({}).sortable(res.locals._sort).lean(), // trả về plain JavaScript object chứ không phải document nữa vì chỉ render ra danh sách món ăn — không cần .save() hay gì cả
            Dish.countDocumentsWithDeleted({ deleted: true }),
        ])
            .then(([dishes, deletedCount]) =>
                res.render('me/stored-dishes', {
                    user: req.session.user,
                    dishes,
                    deletedCount,
                }),
            )

            .catch(next);
    }

    //[GET] /me/bin/dishes
    deletedDishes(req, res, next) {
        Dish.findWithDeleted({ deleted: true })
            .then((dishes) =>
                res.render('me/deleted-dishes', {
                    user: req.session.user,
                    dishes: multipleMongooseToObject(dishes),
                }),
            )
            .catch(next);
    }
}

module.exports = new MeController();
