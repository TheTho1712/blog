// function userAuth(req, res, next) {
//     if (req.session && req.session.user) {
//         return next(); // Cho phép tiếp tục
//     }
//     res.redirect('/login');

//     // Kiểm tra tài khoản có bị khoá không
//     if (req.user.isLocked) {
//         req.logout(function(err) {
//         if (err) { return next(err); }
//         req.flash('error', 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ Admin để biết thêm chi tiết.');
//         return res.redirect('/login');
//         });
//         return;
//     }
    
//     next();
// }

// module.exports = userAuth;

const User = require('../models/User');

const userAuth = async (req, res, next) => {
    // Nếu chưa đăng nhập
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }

    try {
        // Truy vấn user từ DB để check isLocked "real-time"
        const user = await User.findById(req.session.user._id);

        if (!user) {
            req.session.destroy(() => {
                return res.redirect('/login');
            });
            return;
        }

        if (user.isLocked) {
            req.session.destroy(() => {
                // Gửi thông báo qua session để hiển thị bằng SweetAlert2
                req.session = null;
                res.clearCookie('connect.sid');
                res.redirect('/login?locked=1');
            });
            return;
        }

        // Cho tiếp tục nếu hợp lệ
        next();

    } catch (error) {
        console.error('Middleware userAuth error:', error);
        res.redirect('/login');
    }
};

module.exports = userAuth;
