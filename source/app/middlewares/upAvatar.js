const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../../public/uploads/avatars');

// 🔧 Tạo thư mục nếu chưa tồn tại
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath); // dùng biến path đã đảm bảo tồn tại
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

const upload = multer({ storage });

module.exports = upload;
