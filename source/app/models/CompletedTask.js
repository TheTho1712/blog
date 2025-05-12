const mongoose = require('mongoose');

const CompletedTaskSchema = new mongoose.Schema({
    content: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    completedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CompletedTask', CompletedTaskSchema);
