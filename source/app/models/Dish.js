const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const DishSchema = new mongoose.Schema(
    {
        _id: { type: Number },
        name: { type: String, require: true, minLength: 1 },
        description: { type: String },
        image: { type: String },
        videoId: { type: String },
        time: { type: String },
        level: { type: String },
        age: { type: String },
        slug: { type: String, slug: 'name', unique: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true,
        },
        ingredients: [{ type: String }],
        steps: [{ type: String }],
        expImages: [{ type: String }],
        tips: { type: String },
        comments: [
            {
                username: { type: String },
                content: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        _id: false,
        timestamps: true,
    },
);

DishSchema.query.sortable = function ({ column, type } = {}) {
    const isValidType = ['asc', 'desc'].includes(type?.toLowerCase());
    if (column && isValidType) {
        return this.sort({ [column]: type.toLowerCase() });
    }
    return this;
};

//them plugins
mongoose.plugin(slug);
DishSchema.plugin(AutoIncrement);
DishSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Dish', DishSchema);
