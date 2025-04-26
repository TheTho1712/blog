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
        if (!session) {
            return res.redirect('/login');
        }

        const user = fakeDb.user.find((user) => user.id === session.userId);

        if (!user) {
            return res.redirect('/login');
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

    //GET /search
    search(req, res) {
        res.render('search');
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
            // console.log(sessions);

            res.setHeader(
                'Set-Cookie',
                `sessionId=${sessionId}; HttpOnly; Max-Age=3600`
            ).redirect('/');
            return;
        }
        res.send('tai khoan khong ton tai');
    }
    // test(req, res) {
    //     const session = sessions[req.cookies.sessionId];
    //     if (!session) {
    //         return res.redirect('/login');
    //     }

    //     const user = fakeDb.user.find((user) => user.id === session.userId);

    //     if (!user) {
    //         return res.redirect('/login');
    //     }
    //     res.render('test', { user });
    // }

    logout(req, res) {
        delete sessions[req.cookies.sessionId];
        res.setHeader(
            'Set-Cookie',
            `sessionId=; Max-Age=0`
        ).redirect('/login');
    }

}

module.exports = new SiteController();
