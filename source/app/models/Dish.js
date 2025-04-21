const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const DishSchema = new mongoose.Schema({
    name: { type: String, require: true, minLength: 1},
    description: { type: String},
    image: { type: String},
    videoId: { type: String},
    time: { type: String},
    slug: { type: String, slug: 'name', unique: true},
}, {
    timestamps: true,
});

module.exports = mongoose.model('Dish', DishSchema);
