const User = require('../models/user');
const { storeReturnTo } = require('../middleware');

module.exports.renderRegister = (req,res) =>{
    res.render('users/register');
}

module.exports.register =  async (req,res) =>{
    try{
        const {username, password, email} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
        //res.render('users/register');
    } catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req,res) =>{
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back');
    //const redirectUrl = req.session.storeReturnTo || '/campgrounds' ;
    //delete req.session.storeReturnTo;
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    //req.logout();//logs user out
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}