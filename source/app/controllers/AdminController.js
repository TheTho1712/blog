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

    // [GET] /admin/user/:id/info
    async getUserInfo(req, res) {
        try {
            const userId = req.params.id;

            const profileUser = await User.findById(userId);
            if (!profileUser) {
                req.session.message = {
                    type: 'error',
                    text: 'Người dùng không tồn tại'
                };
                return res.redirect('/admin/dashboard');
            }

            const postCount = await Dish.countDocuments({ userId: userId });

            const userInfo = {
                ...profileUser.toObject(),
                postCount: postCount || 0,
                commentCount: 0,
                likeCount: 0,    
            };

            res.render('user-info', {
                title: 'Thông tin người dùng',
                // user: req.user,
                profileUser: userInfo,
            });
        } catch (error) {
            console.error('Lỗi khi load thông tin người dùng:', error);
            res.status(500).send('Lỗi server');
        }
    }

    async changeUserRole(req, res) {
        try {
            const userId = req.params.id;
            
            // Tìm user trong database
            const user = await User.findById(userId);
            
            if (!user) {
                return res.json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }
            
            // Chỉ cho phép chuyển đổi giữa member và moderator
            // Không thay đổi vai trò admin
            if (user.role === 'admin') {
                return res.json({
                    success: false,
                    message: 'Không thể thay đổi vai trò của Admin'
                });
            }
            
            // Logic chuyển đổi mới: chỉ giữa member và moderator
            const newRole = user.role === 'user' ? 'moderator' : 'user';
            const oldRole = user.role;
            user.role = newRole;
            
            // Lưu thay đổi vào database
            await user.save();
            
            const roleNames = {
                'admin': 'Admin',
                'moderator': 'Moderator', 
                'user': 'Thành viên'
            };
            
            // Trả về kết quả dạng JSON
            return res.json({
            success: true,
            message: `Đã thay đổi vai trò của ${user.username} thành ${roleNames[newRole]}`,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                oldRole: oldRole
            }
            });
            
        } catch (error) {
            console.error('Lỗi khi thay đổi vai trò:', error);
            return res.json({
            success: false,
            message: 'Đã xảy ra lỗi khi thay đổi vai trò người dùng'
            });
        }
    }
}

module.exports = new AdminController();
