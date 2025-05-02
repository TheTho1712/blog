function userAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // Cho phép tiếp tục
    }
    res.redirect('/login');
}

module.exports = userAuth;