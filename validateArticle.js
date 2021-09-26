const { string } = require('joi');
const Joi = require('joi');

const validateArticle = (req, res, next) => {
    const articleSchema = Joi.object({
        title: Joi.string().required().min(2),
        description: Joi.string().required().min(3),
        body: Joi.string().required().min(10),
        image: Joi.string()
    })
    const {error} = articleSchema.validate(req.body.article)
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        console.error(error.details)
        res.render('error/400', {msg})
    } else {
        next()
    }
}

module.exports = validateArticle;