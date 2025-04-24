const Dish = require('../models/Dish');
const { multipleMongooseToObject } = require('../../util/mongoose');

class MeController {
    //GET /me/stored/dishes
    storedDishes(req, res, next) {
        // Dish.countDocumentsDeleted()
        // .then((deletedCount) => {
        //     console.log('số món ăn đã bị xoá: ', deletedCount);
        // })
        //     .catch(next);
        // Dish.find({})
        //     .then((dishes) =>
        //         res.render('me/stored-dishes', {
        //             dishes: multipleMongooseToObject(dishes),
        //         }),
        //     )
        //     .catch(next);
        // Promise.all([Dish.find({}), Dish.countDocumentsDeleted()])
        //     .then(([dishes, deletedCount]) => {
        //         res.render('me/stored-dishes', {
        //             dishes: multipleMongooseToObject(dishes),
        //             deletedCount,
        //         });
        //     })
        //     .catch(next);
        // Promise.all([
        //     Dish.find({}),
        //     Dish.countDocumentsDeleted(),
        //     Dish.countDocuments({ deletedAt: { $ne: null } }), // kiểm tra thủ công số món đã xóa
        // ])
        // .then(([dishes, deletedCount, manualDeletedCount]) => {
        //     console.log("Số món đã xóa (từ plugin mongoose-delete):", deletedCount);
        //     console.log("Số món đã xóa (đếm thủ công):", manualDeletedCount);
        //     res.render('me/stored-dishes', {
        //         dishes: multipleMongooseToObject(dishes),
        //         deletedCount,
        //         manualDeletedCount, // hiển thị để so sánh
        //     });
        // })
        // .catch(next);

        Promise.all([
            Dish.find({}).lean(),
            Dish.countDocumentsWithDeleted({ deleted: true }),
        ])
            .then(([dishes, deletedCount]) =>
                res.render('me/stored-dishes', {
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
                    dishes: multipleMongooseToObject(dishes),
                }),
            )
            .catch(next);
    }
}

module.exports = new MeController();
