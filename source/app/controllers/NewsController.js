class NewsController {
    // GET news
    news(req, res) {
        res.render('news');
    }

    show(req, res) {
        res.send('news 1');
    }
}

module.exports = new NewsController();
