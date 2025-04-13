class SiteController {
    // GET /
    index(req, res) {
        res.render('home');
    }

    //GET /search
    search(req, res) {
        res.render('search');
    }

                register(req, res) {
                res.render('testregister');
        }
}

module.exports = new SiteController();
