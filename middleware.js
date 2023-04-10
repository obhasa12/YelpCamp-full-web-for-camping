const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You mush be signed in !!!");
        return res.redirect('/login');
    }
    next();
}

module.exports = isLoggedIn;