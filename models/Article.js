const mongoose = require('mongoose');
const slugify = require('slugify');
const {Schema} = mongoose;

const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }, 
    body: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

ArticleSchema.pre('validate', function(next) {
    if (this.title) {
        this.slug = slugify(this.title, {lower: true, strict: true})
    }

    next()
})

module.exports = mongoose.model('Article', ArticleSchema);