const Dish = require('../models/Dish');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { multipleMongooseToObject } = require('../../util/mongoose');

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
            const newUser = new User({ username, password: hashedPassword, email, gender, age });
            await newUser.save();
    
            return res.render('register', { success: true });
    
        } catch (error) {
            console.error(error);
            return res.render('register', {
                error: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.',
            });
        }
    }


    loginForm(req, res) {
        // const success = req.query.success === 'true';
        // res.render('login');
        const passwordChanged = req.session.passwordChanged;
        delete req.session.passwordChanged;

        res.render('login', { passwordChanged });
    }

    //POST /login
    // login(req, res) {
    //     const { email, password } = req.body;
    //     const user = fakeDb.user.find((user) => user.email === email && user.password === password);
    //     if (user) {
    //         const sessionId = Date.now().toString();
    //         sessions[sessionId] = {
    //             userId: user.id,
    //         };

    //         res.setHeader(
    //             'Set-Cookie',
    //             `sessionId=${sessionId}; HttpOnly; Max-Age=3600`
    //         )
    //         return res.render('login', { success: true });
    //     }
    //     res.render('login', {
    //         error: 'Sai tài khoản hoặc mật khẩu không đúng',
    //     });
    // }
    // async login(req, res) {
    //     const { email, password } = req.body;

    //     try {
    //         const user = await User.findOne({ email });
    //         if(!user) {
    //             return res.render('login', {
    //                 error: 'Sai tài khoản hoặc mật khẩu không đúng',
    //             });
    //         }

    //         const passwordMatch = await bcrypt.compare(password, user.password);
    //         if (!passwordMatch) {
    //             return res.render('login', {
    //                 error: 'Sai tài khoản hoặc mật khẩu không đúng',
    //             });
    //         }
    //         // const sessionId = Date.now().toString();
    //         // sessions[sessionId] = {
    //         //     userId: user._id,
    //         // };
    //         // res.setHeader('Set-Cookie', [
    //         //     'loginSuccess=true; Max-Age=5; Path=/',
    //         //     `sessionId=${sessionId}; HttpOnly; Max-Age=3600`
    //         // ])
    //         req.session.user = {
    //             _id: user._id,
    //             username: user.username,
    //           };
    //         return res.redirect('/');
    //     } catch (err) {
    //         console.error(err);
    //         res.render('login', {
    //             error: 'Đã xảy ra lỗi khi đăng nhập',
    //         });
    //     }
    // }

    

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
                email: user.email
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
    
    
    // logout(req, res) {
    //     delete sessions[req.cookies.sessionId];
    //     res.setHeader(
    //         'Set-Cookie',
    //         `sessionId=; Max-Age=0`
    //     ).redirect('/');
    // }
    //GET //me/profile
    profile(req, res) { 
        res.render('profile', {
            user: req.session.user,
        });
    }

    changePasswordForm(req, res) {
        res.render('change-password');
    }

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

    async deleteAccount(req, res) {
        await User.findByIdAndDelete(req.session.user._id);
        req.session.destroy();
        res.redirect('/');
    }
}

module.exports = new SiteController();
