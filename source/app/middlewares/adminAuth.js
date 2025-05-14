function adminAuth(req, res, next) {
  // console.log('Session user:', req.session.user);
  if (req.session && req.session.user && req.session.user.role === 'admin' || req.session.user.role === 'moderator') {
    return next();
  }
  res.redirect('/?error=Bạn không có quyền truy cập vào trang này');
}

module.exports = adminAuth;