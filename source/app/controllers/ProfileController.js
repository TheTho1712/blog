const User = require('../models/User');
const Dish = require('../models/Dish');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const Task = require('../models/Task'); // Import model Task
const CompletedTask = require('../models/CompletedTask'); // Import model CompletedTask

const DEFAULT_AVATAR = '/img/default-avatar.png';
const sessions = {};

class ProfileController {
    //GET /profile
    async profile(req, res) {
        try {
            const user = await User.findById(req.session.user._id);
            const tasks = await Task.find({ userId: user._id });
            const success = req.session.success;
            const error = req.session.error;
            delete req.session.success;
            delete req.session.error;

            res.render('profile', {
                user,
                tasks,
                success,
                error,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi khi tải trang hồ sơ');
        }
    }

    //GET /profile/change-password
    changePasswordForm(req, res) {
        res.render('change-password');
    }

    //POST /profile/change-password
    async changePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.session.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            req.session.error = 'Mật khẩu hiện tại không đúng.';
            return res.redirect('/profile');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Đặt cờ trong session để hiển thị thông báo ở trang login
        req.session.passwordChanged = true;

        // Xóa session user và chuyển về login
        req.session.user = null;
        res.redirect('/login');
    }

    //GET /profile/change-avatar
    changeAvatarForm(req, res) {
        res.render('profile', {
            user: req.session.user,
        });
    }

    //POST /profile/change-avatar
    // Xử lý đổi avatar
    async changeAvatar(req, res) {
        if (!req.file) {
            req.session.error = 'Vui lòng chọn một hình ảnh.';
            return res.redirect('/profile');
        }

        const avatarPath = '/uploads/avatars/' + req.file.filename;

        // xoá avatar cũ nếu không phải avatar mặc định
        const oldAvatar = req.session.user.avatar;
        if (oldAvatar && oldAvatar !== DEFAULT_AVATAR) {
            const oldPath = path.join(__dirname, '../../public', oldAvatar);
            fs.unlink(oldPath, (err) => {
                if (err) console.error('Không thể xóa ảnh cũ:', err);
            });
        }

        // cập nhật user
        await User.findByIdAndUpdate(req.session.user._id, {
            avatar: avatarPath,
        });
        req.session.user.avatar = avatarPath;

        req.session.success = 'Cập nhật ảnh đại diện thành công';
        res.redirect('/profile');
    }

    // POST /profile/delete
    async deleteAccount(req, res) {
        await User.findByIdAndDelete(req.session.user._id);
        req.session.destroy();
        res.redirect('/');
    }

    // POST /profile/delete-avatar
    async deleteAvatar(req, res) {
        const DEFAULT_AVATAR = '/img/default-avatar.png';
        const oldAvatar = req.session.user.avatar;

        // Nếu avatar hiện tại không phải là mặc định thì xoá file cũ
        if (oldAvatar && oldAvatar !== DEFAULT_AVATAR) {
            const oldPath = path.join(__dirname, '../../public', oldAvatar);
            fs.unlink(oldPath, (err) => {
                if (err) console.error('Không thể xóa ảnh cũ:', err);
            });
        }

        // Cập nhật lại avatar thành mặc định
        await User.findByIdAndUpdate(req.session.user._id, {
            avatar: DEFAULT_AVATAR,
        });
        req.session.user.avatar = DEFAULT_AVATAR;

        req.session.success = 'Đã xoá ảnh đại diện';
        res.redirect('/profile');
    }

    // POST /profile/update
    async editProfileForm(req, res) {
        const { username, email, gender, age , role} = req.body;
        const userId = req.session.user._id;

        try {
            await User.updateOne(
                { _id: userId },
                {
                    username,
                    email,
                    gender,
                    age,
                    role,
                },
            );

            req.session.user.username = username;
            req.session.user.email = email;
            req.session.user.gender = gender;
            req.session.user.age = age;
            // Cập nhật thông tin người dùng trong session
            req.session.success = 'Cập nhật thông tin thành công';

            res.redirect('/profile');
        } catch (err) {
            console.error(err);
            res.status(500).send('Lỗi cập nhật thông tin');
        }
    }

    async addTask(req, res, next) {
        const user = req.session.user;
        const { content } = req.body;

        if (!content) {
            return res.redirect('/profile?error=Nội dung không được để trống');
        }

        try {
            const newTask = new Task({
                content,
                userId: user._id,
            });
            await newTask.save();
            res.redirect('/profile');
        } catch (err) {
            console.error(err);
            res.redirect('/profile?error=Lỗi khi thêm công việc');
        }
    }

    async completeTasksForm(req, res) {
        try {
            const userId = req.session.user._id;
            const completedTasks = await CompletedTask.find({ userId }).sort({
                completedAt: -1,
            });
            res.render('completed', { completedTasks });
        } catch (err) {
            console.error(err);
            res.redirect(
                '/profile?error=Lỗi khi tải danh sách việc đã hoàn thành',
            );
        }
    }

    async completeTask(req, res) {
        let completedIds = req.body.completedTasks;
        if (!Array.isArray(completedIds)) completedIds = [completedIds];

        try {
            for (const id of completedIds) {
                const task = await Task.findById(id);
                if (task) {
                    await CompletedTask.create({
                        content: task.content,
                        userId: task.userId,
                    });
                    await task.deleteOne();
                    req.session.success = 'Đã hoàn thành task';
                }
            }
            res.redirect('/profile'); // Refresh lại trang, đã mất task được check
        } catch (error) {
            console.error(error);
            res.redirect('/profile?error=Không thể hoàn thành task');
        }
    }

    // Xóa task
    async deleteTask(req, res) {
        const taskId = req.params.id;
        const userId = req.session.user._id;

        try {
            const task = await Task.findOne({ _id: taskId, userId });
            if (!task) {
                return res.redirect('/profile?error=Không tìm thấy task');
            }

            await task.deleteOne();
            req.session.success = 'Đã xoá task';
            res.redirect('/profile');
        } catch (err) {
            console.error(err);
            res.redirect('/profile?error=Lỗi khi xoá task');
        }
    }

    //
    async deleteCompleted(req, res) {
        const userId = req.session.user._id;
        try {
            await CompletedTask.deleteMany({ userId });
            req.session.success = 'Đã xoá tất cả công việc đã hoàn thành';
            res.redirect('/profile/completed');
        } catch (err) {
            console.error('Lỗi khi xoá tất cả công việc đã hoàn thành:', err);
            req.session.error = 'Lỗi khi xoá tất cả công việc đã hoàn thành';
            res.redirect('/profile/completed');
        }
    }

    async deleteCompletedOne(req, res) {
        const taskId = req.params.id;
        const userId = req.session.user._id;

        try {
            const task = await CompletedTask.findOne({ _id: taskId, userId });
            if (!task) {
                req.session.error = 'Không tìm thấy công việc đã hoàn thành.';
                return res.redirect('/profile/completed');
            }

            await task.deleteOne();
            req.session.success = 'Đã xoá công việc đã hoàn thành.';
            res.redirect('/profile/completed');
        } catch (err) {
            console.error('Lỗi khi xoá task đã hoàn thành:', err);
            req.session.error = 'Lỗi khi xoá công việc đã hoàn thành.';
            res.redirect('/profile/completed');
        }
    }

    // Xem hoạt động của người dùng
    async showUserActivity(req, res) {
        try {
        // Lấy thông tin người dùng hiện tại
        const userId = req.session.user._id;
        
        // Lấy đầy đủ thông tin người dùng từ database
        const user = await User.findById(userId);
        
        if (!user) {
            return res.redirect('/profile');
        }
        
        // Đếm số lượng bài viết của người dùng
        const postCount = await Dish.countDocuments({ userId: userId });
        // Đếm số lượng bình luận của người dùng
        const commentResult = await Dish.aggregate([
            // Mở rộng mảng comments để mỗi comment trở thành một document riêng
            { $unwind: "$comments" },
            // Lọc chỉ lấy comment của user hiện tại
            { $match: { "comments.username": user.username } },
            // Đếm tổng số comment
            { $count: "total" }
        ]);
        const commentCount = commentResult.length > 0 ? commentResult[0].total : 0;

        const recentPosts = await Dish.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
        const recentComments = await Dish.aggregate([
            { $unwind: "$comments" },
            { $match: { "comments.username": user.username } },
            { $sort: { "comments.createdAt": -1 } },
            { $limit: 5 },
            { $project: {
                _id: 1, // 1: Giữ lại trường này, 0: Loại bỏ trường này
                name: 1,
                slug: 1,
                comment: "$comments.content",
                commentDate: "$comments.createdAt"
            }}
        ]);

        // Tạo đối tượng dữ liệu cho view
        const userInfo = {
            ...user.toObject(),
            postCount,
            commentCount,
            likeCount: 0,
        };
        
        // Render view với dữ liệu đã chuẩn bị
        res.render('info', {
            user: userInfo,
            recentPosts: recentPosts,
            recentComments: recentComments,
        });
        
        } catch (error) {
            console.error('Lỗi khi hiển thị hoạt động người dùng:', error);
            req.session.error = 'Lỗi khi hiển thị hoạt động người dùng';
            res.redirect('/profile');
        }
    }
    
}

module.exports = new ProfileController();
