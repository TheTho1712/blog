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
    // async index(req, res, next) {
        
    //     // if (!req.session.user) {
    //     //     return res.redirect('/login');
    //     // }
    //     const loginSuccess = req.session.loginSuccess;
    //     delete req.session.loginSuccess; // clear sau khi dùng
    //     Dish.find({})
    //         .then((dishes) => {
    //             res.render('home', {
    //                 user: req.session.user,
    //                 dishes: multipleMongooseToObject(dishes),
    //                 loginSuccess,
    //             });
    //         })
    //         .catch(next);
    // }

    async index(req, res, next) {
        // Kiểm tra đăng nhập nếu cần
        // if (!req.session.user) {
        //     return res.redirect('/login');
        // }
    
        const loginSuccess = req.session.loginSuccess;
        delete req.session.loginSuccess; // Clear session sau khi dùng
    
        const PAGE_SIZE = 6; // Số món ăn trên mỗi trang
        const page = parseInt(req.query.page) || 1;
    
        try {
            const totalDishes = await Dish.countDocuments({});
            const dishes = await Dish.find({})
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .lean();
    
            res.render('home', {
                user: req.session.user,
                dishes,
                loginSuccess,
                currentPage: page,
                totalPages: Math.ceil(totalDishes / PAGE_SIZE),
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
                { name: { $regex: keyword, $options: 'i' }},
                { description: { $regex: keyword, $options: 'i' }},
                { time: { $regex: keyword, $options: 'i' }},
                { level: { $regex: keyword, $options: 'i' }}
            ]
        })
        .then(dishes => {
            res.render('search-results', {
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
    
    // async pagination(req, res, next) {
    //     // const page = parseInt(req.query.page) || 1; // Trang hiện tại
    //     // const skip = (page - 1) * PAGE_SIZE; // Số lượng món ăn cần bỏ qua

    //     try {
    //         const page = parseInt(req.query.page) || 1; // Trang hiện tại
    //         const totalDishes = await Dish.countDocuments({}); // Tổng số món ăn
    //         const dishes = await Dish.find({})
    //             .skip((page - 1) * PAGE_SIZE)
    //             .limit(PAGE_SIZE);

    //         res.render('home', {
    //             // dishes: multipleMongooseToObject(dishes),
    //             dishes,
    //             currentPage: page,
    //             totalPages: Math.ceil(totalDishes / PAGE_SIZE), // Tổng số trang
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

}

module.exports = new SiteController();
