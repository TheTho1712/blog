const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');

const DishSchema = new mongoose.Schema(
    {
        name: { type: String, require: true, minLength: 1 },
        description: { type: String },
        image: { type: String },
        videoId: { type: String },
        time: { type: String },
        level: { type: String },
        slug: { type: String, slug: 'name', unique: true },
    },
    {
        timestamps: true,
    },
);

//them plugins
mongoose.plugin(slug);
DishSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Dish', DishSchema);
