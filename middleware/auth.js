module.exports.checkAuth = function(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You need to login or register to create or edit an article!')
        return res.redirect('/login')
    } else {
        next();
    }
}

