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
    }

    //[GET] /dishes/:id/edit
    edit(req, res, next) {
        Dish.findById(req.params.id)
            .then(dish => res.render('dishes/edit', {
                dish: mongooseToObject(dish)
            }))
            .catch(next);
    }

    // // //[PUT] /dishes/:id
    update(req, res, next) {
        Dish.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/me/stored/dishes'))
            .catch(next);
    }
    
    //[DELETE] /dishes/:id
    delete(req, res, next) {
        Dish.deleteOne({_id: req.params.id})
            .then(() => res.redirect('/me/stored/dishes'))
            .catch(next);
    }

}

module.exports = new DishController();
