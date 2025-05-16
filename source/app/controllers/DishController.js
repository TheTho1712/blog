const Dish = require('../models/Dish');
const { mongooseToObject } = require('../../util/mongoose');
const fs = require('fs');
const { create } = require('../models/User');
path = require('path');

class DishController {
    //[GET] /dishes/:slug
    show(req, res, next) {
        Dish.findOne({ slug: req.params.slug })
            .populate('userId')
            .lean()
            .then((dish) => {
                if (dish && dish.comments && dish.comments.length > 0) {
                dish.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }
                res.render('dishes/show', { dish });
            })
            .catch(next);
    }

    //[GET] /dishes/create
    create(req, res, next) {
        res.render('dishes/create');
    }

    //[POST] /dishes/store
    store(req, res, next) {
        req.body.image = `https://i.ytimg.com/vi/${req.body.videoId}/hqdefault.jpg`;
        req.body.userId = req.session.user._id;
        req.body._id = 1;

        req.body.expImages = req.files.map(
            (file) => `/pictures/${file.filename}`,
        );
        // const dish = new Dish(req.body);
        const dish = new Dish({
            ...req.body,
            expImages: req.body.expImages,
            userId: req.session.user._id,
        });
        dish.save()
            .then(() => res.redirect('/'))
            .catch((error) => {
                res.status(500).send(
                    `Error when saving dish: ${error.message}`,
                );
            });
    }

    //[GET] /dishes/:id/edit
    edit(req, res, next) {
        Dish.findById(req.params.id)
            .then((dish) =>
                res.render('dishes/edit', {
                    dish: mongooseToObject(dish),
                }),
            )
            .catch(next);
    }

    async update(req, res, next) {
        try {
            const updateData = { ...req.body };

            // Lấy dữ liệu món ăn cũ
            const dish = await Dish.findById(req.params.id);

            // Nếu có ảnh mới => XÓA ẢNH CŨ
            if (req.files && req.files.length > 0) {
                if (dish.expImages && dish.expImages.length > 0) {
                    dish.expImages.forEach((imagePath) => {
                        const relativePath = imagePath.replace(/^\/+/, ''); // bỏ dấu / đầu
                        const fullPath = path.join(
                            __dirname,
                            '..',
                            '..',
                            'public',
                            relativePath,
                        );
                        // console.log('Trying to delete file at:', fullPath);
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                        }
                    });
                }
                // Gán ảnh mới
                updateData.expImages = req.files.map(
                    (file) => '/pictures/' + file.filename,
                );
            }

            // Cập nhật lại thumbnail nếu videoId mới được cung cấp
            if (updateData.videoId) {
                updateData.image = `https://img.youtube.com/vi/${updateData.videoId}/sddefault.jpg`;
            }

            await Dish.updateOne({ _id: req.params.id }, updateData);
            res.redirect('/');
        } catch (error) {
            console.error('Error when updating dish:', error);
            res.status(500).send('Không thể cập nhật món ăn');
        }
    }

    // [DELETE] /dishes/:id
    delete(req, res, next) {
        Dish.delete({ _id: req.params.id })
            .then(() => res.redirect('/me/stored/dishes'))
            .catch(next);
    }

    // [DELETE] /dishes/:id/force
    forceDelete(req, res, next) {
        Dish.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('/me/bin/dishes'))
            .catch(next);
    }

    // [PATCH] /dishes/:id/restore
    restore(req, res, next) {
        Dish.restore({ _id: req.params.id })
            .then(() => res.redirect('/me/bin/dishes'))
            .catch(next);
    }

    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Dish.delete({ _id: { $in: req.body.dishIds } })
                    .then(() => {
                        res.redirect('/me/stored/dishes');
                    })
                    .catch(next);
                break;
            case 'forceDelete':
                Dish.deleteMany({ _id: { $in: req.body.dishIds } })
                    .then(() => {
                        res.redirect('/me/stored/dishes');
                    })
                    .catch(next);
                break;
            case 'restore':
                Dish.restore({ _id: { $in: req.body.dishIds } })
                    .then(() => {
                        res.redirect('/me/bin/dishes');
                    })
                    .catch(next);
                break;
            default:
                res.json({ message: 'action invalid' });
        }
    }

    async comments(req, res) {
        try {
            const { content } = req.body;

            if(!req.session.user) {
                return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để bình luận' });
            }

            const dish = await Dish.findOne({ slug: req.params.slug });

            dish.comments.push({
            username: req.session.user.username,
            content,
            createdAt: new Date(),
            
        });
    
            await dish.save();
            res.json({ success: true, comment: dish.comments[dish.comments.length - 1] });
            
        } catch (err) {
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
        }   
    }

}

module.exports = new DishController();
