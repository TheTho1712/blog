const Dish = require('../models/Dish');
const User = require('../models/User');
const Notification = require('../models/Notification');

const flash = require('connect-flash');
class AdminController {
    async getDashboard(req, res) {
        try {

            const dishes = await Dish.find().populate('userId');
            const users = await User.find();
            const message = req.session.message;
            delete req.session.message; // Xoá thông báo sau khi đã sử dụng

            res.render('dashboard', {
                title: 'Trang quản trị',
                dishes,
                users,
                message,
            });
        } catch (error) {
            console.error('Lỗi khi load dashboard:', error);
            res.status(500).send('Lỗi server');
        }
    }

    // [DELETE] /admin/:id
    async delete(req, res) {
        const dish = await Dish.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true },
        );

        // Nếu tìm được bài viết và nó có userId
        if (dish && dish.userId) {
            await Notification.create({
                userId: dish.userId,
                message: `Bài viết "${dish.name}" của bạn đã bị xoá vì không hợp lệ.`,
            });
        }

        res.redirect('/admin/dashboard');
    }

    // [POST] /admin/user/lock/:id
    async lockUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            
            if (!user) {
                req.session.message = {
                    type: 'error',
                    text: 'Người dùng không tồn tại'
                };
                return res.redirect('/admin/dashboard');
            }
            
            // Đảo ngược trạng thái khoá
            const newLockedStatus = !user.isLocked;
            
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { isLocked: newLockedStatus },
                { new: true }
            );
            
            // if(!newLockedStatus) {
            //     // Nếu mở khoá tài khoản, gửi thông báo
            //     await Notification.findOneAndDelete({
            //         userId: user._id,
            //         message: 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ Admin để biết thêm chi tiết.'
            //     }, {sort: { createdAt: -1 }}
            //     );
            // }


            // Tạo thông báo cho người dùng
            if(newLockedStatus) {
                await Notification.create({
                    userId: user._id,
                    message: 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ Admin để biết thêm chi tiết.'
                });
            }
            
            req.session.message = {
                type: newLockedStatus ? 'success' : 'info',
                    text: newLockedStatus 
                        ? `Đã khoá tài khoản của ${user.username}` 
                        : `Đã mở khoá tài khoản của ${user.username}`
                };
                res.redirect('/admin/dashboard');
        } catch (error) {
            req.session.message = {
                type: 'error',
                text: 'Đã xảy ra lỗi khi khoá/mở khoá tài khoản'
            };
            res.redirect('/admin/dashboard');
        }
    }
}

module.exports = new AdminController();
