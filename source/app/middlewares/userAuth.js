function userAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // Cho phép tiếp tục
    }
    // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
    res.redirect('/login');
}

module.exports = userAuth;