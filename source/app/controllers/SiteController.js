const Dish = require('../models/Dish');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { multipleMongooseToObject } = require('../../util/mongoose');
const path = require('path');
const fs = require('fs');
const DEFAULT_AVATAR = '/img/default-avatar.png';
const sessions = {}

function isValidEmail(email) {
    // Regex đơn giản kiểm tra định dạng email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

class SiteController {
    async index(req, res, next) {
        
        // if (!req.session.user) {
        //     return res.redirect('/login');
        // }
        const loginSuccess = req.session.loginSuccess;
        delete req.session.loginSuccess; // clear sau khi dùng
        Dish.find({})
            .then((dishes) => {
                res.render('home', {
                    user: req.session.user,
                    dishes: multipleMongooseToObject(dishes),
                    loginSuccess,
                });
            })
            .catch(next);
    }

    //GET /search
    searchResult(req, res, next) {
        const keyword = req.query.q;
        
        if (!keyword) {
            return res.redirect('/');
        }

        Dish.find({
            $or: [
                // $regex: So khớp chữ, $options: 'i': Không phân biệt chữ hoa chữ thường
                { name: { $regex: keyword, $options: 'i' }},
                { description: { $regex: keyword, $options: 'i' }},
                { time: { $regex: keyword, $options: 'i' }},
                { level: { $regex: keyword, $options: 'i' }}
            ]
        })
        .then(dishes => {
            res.render('searchResults', {
                dishes: multipleMongooseToObject(dishes),
                keyword: keyword,
                resultsCount: dishes.length
            });
        })
        .catch(next);
    }

    //GET /register
    registerForm(req, res) {
        res.render('register');
    }

    //POST /register
    // async register(req, res) {
    //     const { username, password, email } = req.body;

    //     const hashedPassword = await bcrypt.hash(password, 10);
    
    //     const newUser = new User({ username, password: hashedPassword, email });
    //     await newUser.save();
    
        
    //     res.redirect('/login');
    // };

    //POST /register
    async register(req, res) {
        const { username, password, email, gender, age } = req.body;

        if (!isValidEmail(email)) {
            return res.render('register', {
                error: 'Email không hợp lệ. Vui lòng nhập đúng định dạng.',
            });
        }
    
        try {

            // Kiểm tra xem email đã tồn tại trong db chưa
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.render('register', {
                    error: 'Email đã được sử dụng.',
                });
        }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ 
                username,
                password: hashedPassword,
                email, 
                gender, 
                age,
                avatar: DEFAULT_AVATAR, // Đường dẫn đến ảnh mặc định
            });
            await newUser.save();
    
            return res.render('register', { success: true });
    
        } catch (error) {
            console.error(error);
            return res.render('register', {
                error: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.',
            });
        }
    }

    //GET /login
    loginForm(req, res) {
        const passwordChanged = req.session.passwordChanged;
        delete req.session.passwordChanged;

        res.render('login', { passwordChanged });
    }

    //POST /login
    async login(req, res) {
        const { email, password } = req.body;
    
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.render('login', {
                    error: 'Sai tài khoản hoặc mật khẩu không đúng',
                });
            }
    
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.render('login', {
                    error: 'Sai tài khoản hoặc mật khẩu không đúng',
                });
            }
    
            // Gán thông tin user vào session
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                gender: user.gender,
                age: user.age,
                avatar: user.avatar,
            };
    
            return res.render('login', {
                success: true,
            });
        } catch (err) {
            console.error(err);
            res.render('login', {
                error: 'Đã xảy ra lỗi khi đăng nhập',
            });
        }
    }
    

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Lỗi khi đăng xuất:', err);
            }
            res.redirect('/');
        });
    }
    
    //GET //me/profile
    profile(req, res) { 
        const success = req.session.success;
        const error = req.session.error;
        delete req.session.success;
        delete req.session.error;
        res.render('profile', {
            user: req.session.user,
            success,
            error,
        });
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
            return res.render('change-password', {
                error: 'Mật khẩu hiện tại không đúng.',
            });
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
        await User.findByIdAndUpdate(req.session.user._id, { avatar: avatarPath });
        req.session.user.avatar = avatarPath;

        req.session.success = 'Cập nhật avatar thành công';
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
        await User.findByIdAndUpdate(req.session.user._id, { avatar: DEFAULT_AVATAR });
        req.session.user.avatar = DEFAULT_AVATAR;
    
        req.session.success = 'Avatar đã được đặt lại mặc định.';
        res.redirect('/profile');
    }
}

module.exports = new SiteController();
