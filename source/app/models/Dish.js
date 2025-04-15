const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const DishSchema = new mongoose.Schema({
    name: { type: String, default: '', minLength: 1, maxLength: 200},
    description: { type: String, maxLength: 1000 },
    image: { type: String, maxLength: 200},
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now},

    
});

module.exports = mongoose.model('Dish', DishSchema);
