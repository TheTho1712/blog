const Dish = require('../models/Dish');
const { mongooseToObject } = require('../../util/mongoose');

class DishController {
    //[GET] /dishes/:slug
    show(req, res, next) {
        Dish.findOne({ slug: req.params.slug })
            .then((dish) => {
                res.render('dishes/show', { dish: mongooseToObject(dish) });
            })
            .catch(next);
    }

    //[GET] /dishes/create
    create(req, res, next) {
        res.render('dishes/create');
    }

    //[POST] /dishes/store
    store(req, res, next) {
        const formData = req.body;
        formData.image = `https://i.ytimg.com/vi/${req.body.videoId}/hqdefault.jpg`
        const dish = new Dish(formData);
        dish.save()
            .then(() => res.redirect('/'))
            .catch(error => {
                res.render('error')
            });
        // res.json(req.body);
    }

}

module.exports = new DishController();
