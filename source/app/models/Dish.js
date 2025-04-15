const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const DishSchema = new mongoose.Schema({
    name: { type: String, require: true, minLength: 1, maxLength: 200 },
    description: { type: String, maxLength: 1000 },
    image: { type: String, maxLength: 200 },
    videoId: { type: String, maxLength: 200 },
    level: { type: String, maxLength: 200 },
    slug: { type: String, slug: 'name', unique: true},
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Dish', DishSchema);
