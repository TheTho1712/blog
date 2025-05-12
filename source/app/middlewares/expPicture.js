const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, 'src/public/pictures'); // thư mục lưu ảnh
        cb(null, path.join(__dirname, '../../public/pictures'));
    },
    filename: function (req, file, cb) {
        // cb(null, Date.now() + '-' + file.originalname); // tên file tránh trùng
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
        );
    },
});

const uploadMany = multer({ storage });

module.exports = uploadMany;
