const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  });

module.exports = mongoose.model('Task', TaskSchema);
