const Dish = require('../models/Dish');

class SiteController {
    // GET /
    async index(req, res) {

        const dishes = await Dish.find({});
        res.json(dishes);
        // res.render('home');
    }
    // async index(req, res) {
    //     try {
    //       const dishes = await Dish.find({});
    //       res.json(dishes);
    //     } catch (error) {
    //       res.status(400).json({ err: "ERROR!!!" });
    //     }
    //   }

    //GET /search
    search(req, res) {
        res.render('search');
    }

    register(req, res) {
        res.render('testregister');
    }
}

module.exports = new SiteController();
