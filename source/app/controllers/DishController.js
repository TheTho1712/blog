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
        req.body.image = `https://i.ytimg.com/vi/${req.body.videoId}/hqdefault.jpg`;
        req.body._id = 1;
        const dish = new Dish(req.body);
        dish.save()
            .then(() => res.redirect('/me/stored/dishes'))
            .catch((error) => {
                res.render('error');
            });
    }

    //[GET] /dishes/:id/edit
    edit(req, res, next) {
        Dish.findById(req.params.id)
            .then((dish) =>
                res.render('dishes/edit', {
                    dish: mongooseToObject(dish),
                }),
            )
            .catch(next);
    }

    // // //[PUT] /dishes/:id
    update(req, res, next) {
        Dish.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/me/stored/dishes'))
            .catch(next);
    }

    // [DELETE] /dishes/:id
    delete(req, res, next) {
        Dish.delete({ _id: req.params.id })
            .then(() => res.redirect('/me/stored/dishes'))
            .catch(next);
    }

    // [DELETE] /dishes/:id/force
    forceDelete(req, res, next) {
        Dish.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('/me/bin/dishes'))
            .catch(next);
    }

    // [PATCH] /dishes/:id/restore
    restore(req, res, next) {
        Dish.restore({ _id: req.params.id })
            .then(() => res.redirect('/me/bin/dishes'))
            .catch(next);
    }

    handleFormActions(req, res, next) {
        switch (req.body.action) {
          case "delete":
            Dish.delete({ _id: { $in: req.body.dishIds } })
              .then(() => {
                res.redirect("/me/stored/dishes");
              })
              .catch(next);
            break;
          case "forceDelete":
            Dish.deleteMany({ _id: { $in: req.body.dishIds } })
              .then(() => {
                res.redirect("/me/stored/dishes");
              })
              .catch(next);
            break;
          case "restore":
            Dish.restore({ _id: { $in: req.body.dishIds } })
              .then(() => {
                res.redirect("/me/bin/dishes");
              })
              .catch(next);
              break;
          default:
            res.json({ message: "action invalid" });
        }
      }

}

module.exports = new DishController();
