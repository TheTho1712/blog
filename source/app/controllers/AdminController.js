const Dish = require('../models/Dish');
const User = require('../models/User');
const Notification = require('../models/Notification');

class AdminController {
    async getDashboard(req, res) {
        try {
            // // Kiểm tra quyền
            // if (req.user.role !== 'admin') {
            //   return res.status(403).send('Không có quyền truy cập');
            // }
        
            const dishes = await Dish.find().populate('userId');
            const users = await User.find();
        
            res.render('dashboard', {
              title: 'Trang quản trị',
              dishes,
              users
            });

            } catch (error) {
            console.error('Lỗi khi load dashboard:', error);
            res.status(500).send('Lỗi server');
            }
        }

    // [DELETE] /admin/:id
    async delete(req, res) {
      const dish = await Dish.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
    
      // Nếu tìm được bài viết và nó có userId
      if (dish && dish.userId) {
        await Notification.create({
          userId: dish.userId,
          message: `Bài viết "${dish.name}" của bạn đã bị xoá vì không hợp lệ.`
        });
      }
    
      res.redirect('/admin/dashboard');
    }
};

module.exports = new AdminController();

