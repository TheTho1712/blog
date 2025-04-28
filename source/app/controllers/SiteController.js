const Dish = require('../models/Dish');
const { multipleMongooseToObject } = require('../../util/mongoose');



const fakeDb = {
    user: [
        {
            id: 1,
            email: "nguyenthetho@gmail.com",
            password: "123",
            name: "Nguyễn Thế Thọ",

        },
    ],
}


const sessions = {}

class SiteController {
    index(req, res, next) {
        
        const session = sessions[req.cookies.sessionId];
        // bắt buộc phải đăng nhập mới được vào 
        // if (!session) {
        //     return res.redirect('/login');
        // }

        // const user = fakeDb.user.find((user) => user.id === session.userId); 

        // if (!user) {
        //     return res.redirect('/login');
        // }
        let user = null;

        if (session) {
            user = fakeDb.user.find((user) => user.id === session.userId);
        }
        Dish.find({})
            .then((dishes) => {
                res.render('home', {
                    user: user,
                    dishes: multipleMongooseToObject(dishes),
                });
            })
            .catch(next);
    }

    //GET /dishes/:slug
    dishDetail(req, res, next) {
        const slug = req.params.slug;
    
        Dish.findOne({ slug: slug })
            .then(dish => {
                if (!dish) {
                    return res.status(404).send('Không tìm thấy món ăn');
                }
    
                res.render('dishDetail', {
                    dish: dish.toObject(),
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
    register(req, res) {
        res.render('testregister');
    }

    //GET /introduce
    introduce(req, res) {
        res.render('introduce');
    }

    loginForm(req, res) {
        res.render('login');
    }

    //POST /login
    login(req, res) {
        const { email, password } = req.body;
        const user = fakeDb.user.find((user) => user.email === email && user.password === password);
        if (user) {
            const sessionId = Date.now().toString();
            sessions[sessionId] = {
                userId: user.id,
            };

            res.setHeader(
                'Set-Cookie',
                `sessionId=${sessionId}; HttpOnly; Max-Age=3600`
            )
            return res.render('login', { success: true });
        }
        res.render('login', {
            error: 'Sai tài khoản hoặc mật khẩu không đúng',
        });
    }
    
    logout(req, res) {
        delete sessions[req.cookies.sessionId];
        res.setHeader(
            'Set-Cookie',
            `sessionId=; Max-Age=0`
        ).redirect('/login');
    }

}

module.exports = new SiteController();
