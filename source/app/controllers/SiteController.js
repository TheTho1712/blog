const Dish = require('../models/Dish');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { multipleMongooseToObject } = require('../../util/mongoose');
const path = require('path');
const fs = require('fs');
const { removeListener } = require('process');
const DEFAULT_AVATAR = '/img/default-avatar.png';
const sessions = {};

const nodemailer = require('nodemailer');
const crypto = require('crypto');

const Notification = require('../models/Notification');

// const email = process.env.EMAIL;
// const password = process.env.GMAIL_APP_PASSWORD;

function isValidEmail(email) {
    // Regex đơn giản kiểm tra định dạng email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

class SiteController {
    async index(req, res, next) {
        const loginSuccess = req.session.loginSuccess;
        delete req.session.loginSuccess;

        const PAGE_SIZE = 6;
        const page = parseInt(req.query.page) || 1;

        try {
            const totalDishes = await Dish.countDocuments({});
            const dishes = await Dish.find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .lean();

            const notifications = req.session.user
                ? await Notification.find({
                      userId: req.session.user._id,
                      isRead: false,
                  }).lean()
                : [];

            if (req.session.user) {
                await Notification.updateMany(
                    { userId: req.session.user._id, isRead: false },
                    { isRead: true },
                );
            }

            res.render('home', {
                user: req.session.user,
                dishes,
                loginSuccess,
                currentPage: page,
                totalPages: Math.ceil(totalDishes / PAGE_SIZE),
                notifications,
            });
        } catch (error) {
            next(error);
        }
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
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { time: { $regex: keyword, $options: 'i' } },
                { level: { $regex: keyword, $options: 'i' } },
            ],
        })
            .then((dishes) => {
                res.render('search-results', {
                    dishes: multipleMongooseToObject(dishes),
                    keyword: keyword,
                    resultsCount: dishes.length,
                });
            })
            .catch(next);
    }

    //GET /register
    registerForm(req, res) {
        res.render('register');
    }

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
                role: user.role,
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

    forgotPasswordForm(req, res) {
        const error = req.session.tokenError;
        delete req.session.tokenError;
        res.render('forgot-password', { error });
    }

    async forgotPassword(req, res) {
        const { email } = req.body;
        if (!isValidEmail(email)) {
            return res.render('forgot-password', {
                error: 'Email không hợp lệ. Vui lòng nhập đúng định dạng.',
            });
        }

        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.render('forgot-password', {
                    error: 'Email không tồn tại trong hệ thống.',
                });
            }
            const token = crypto.randomBytes(32).toString('hex'); //tao token random

            // Lưu token vào cơ sở dữ liệu
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 15 * 60 * 1000; // Token có hiệu lực trong 15 phút

            await user.save();

            // tạo transporter gửi email
            // const transporter = nodemailer.createTransport({
            //     service: 'gmail',
            //     auth: {
            //         user: process.env.EMAIL,
            //         pass: process.env.GMAIL_APP_PASSWORD,
            //     }
            // });

            const transporter = nodemailer.createTransport({
                host: 'sandbox.smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: '8c14b49918ad05',
                    pass: 'e6a860a3d7b5b6',
                },
            });

            // gửi link reset mật khẩu
            const resetLink = `http://localhost:3000/reset-password?token=${token}`;
            await transporter.sendMail({
                to: user.email,
                subject: 'Yêu cầu đặt lại mật khẩu',
                html: `
                    <h1>Xin chào ${user.username},</h1>
                    <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                    <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
                    <a href="${resetLink}"> Nhấn vào đây</a>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>`,
            });
            res.render('forgot-password', { success: true });
        } catch (error) {
            console.error(error);
            res.render('forgot-password', {
                error: 'Đã xảy ra lỗi khi gửi email. Vui lòng thử lại.',
            });
        }
    }

    async resetPasswordForm(req, res) {
        // console.log('Token từ URL:', req.query.token);
        const { token } = req.query;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }, // Token chưa hết hạn
        });

        if (!user) {
            console.log('Không tìm thấy user với token:', token);
            const expiredUser = await User.findOne({ resetToken: token });
            if (expiredUser) {
                console.log('Tìm thấy user nhưng token đã hết hạn.');
                console.log(
                    'resetTokenExpiration:',
                    expiredUser.resetTokenExpiration,
                );
            } else {
                console.log('Token không khớp với DB');
            }

            req.session.tokenError =
                'Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
            return res.redirect('/forgot-password');
        }

        res.render('reset-password', { token }); // Truyền token vào form
    }

    async resetPassword(req, res) {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });
        if (!user) {
            req.session.tokenError =
                'Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
            return res.redirect('/forgot-password');
        }

        user.password = await bcrypt.hash(password, 10); // Đổi mật khẩu

        // Xóa token và thời gian hết hạn
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.redirect('/login'); // Hoặc báo thành công
    }

}

module.exports = new SiteController();
