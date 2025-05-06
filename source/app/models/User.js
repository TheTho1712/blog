const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: '/img/default-avatar.png' },
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], default: 'Khác' },
    age: { type: Number, min: 0 },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, {
    timestamps: true,
});

const User = mongoose.model('User', UserSchema);
module.exports = User;