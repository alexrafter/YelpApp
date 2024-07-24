//npm i dotenv
if(process.env.NODE_ENV !== "production"){//development or production
    require('dotenv').config();
}
//console.log(process.env.CLOUDINARY_CLOUD_NAME);
const express = require('express');//npm i express ejs mongoose method-override ejs-mate joi
const MongoStore = require('connect-mongo');
//joi does not escape html
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override') //ALLOW DELETE AND PUT
//npm i ejs-mate
const ejsMate = require('ejs-mate'); // insert partials in templates
const session = require('express-session');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
//npm i passport passport-local passport-local-mongoose
const passport = require('passport');
const LocalStrategy = require('passport-local');
//npm install @maptiler/client@1.8.1
const User = require('./models/user');
//npm i express-mongo-sanitize
//npm i sanitize-html <%= escapes html
const mongoSanitize = require('express-mongo-sanitize');
//CONTROLLER PATTERNS
//npm i helmet
const helmet = require('helmet');


//npm install mongodb
//9Gt3o8oY37P8MWzc
//mongodb+srv://yelpUser:9Gt3o8oY37P8MWzc@clusteryelpapp.b8uxroj.mongodb.net/?retryWrites=true&w=majority&appName=ClusterYelpApp
/*mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true, 
    useUnifiedTopology: true
});*/
//npm install connect-mongo@latest
const dbUrl =  process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl ,{
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "DB Connection error:")); //on error
db.once("open", () =>{ //sucess fully opened
    console.log("DB Connected");
})
const app = express();

app.use(express.urlencoded({ extended: true })); //build in middleware PARSE req.body from form
app.use(methodOverride('_method')) //ALLOW DELETE AND PUT, PATCH
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ddubxrhoy/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET ||  'thisshouldbeabettersecret'
app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));//include dir

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e){
    console.log("Session store error", e);
});

const sessionConfig = {
    name: 'session', // name of cookie
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: { //cookie options
        httpOnly: true, //only accessable voa http not java script
        //secure: true, should only work over https localhost not https for deploy required
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //millis to 1 week
        mageAge: 1000 * 60 * 60 * 24 * 7
    },
    store

};
app.use(session(sessionConfig)); //must be before password.session()
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
//use localStrategy auth method on User model from passport-local-mongoose
passport.serializeUser(User.serializeUser());//how to serialize user how to store in session
passport.deserializeUser(User.deserializeUser());//how to deserialize remove user in session

//middleware for flash messages
app.use((req, res, next) => {
    //FOLLOWING REQUIRED BEFORE
    //app.use(session(sessionConfing));
    //app.use(flash());
    //console.log(req.session);
    //console.log(req.query);
    res.locals.currentUser = req.user; //available in all templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

/*
app.get('/fakeUser', async (req,res) => {
    const user = new User({email: 'alex.rafter@gmail.com', username: 'arafter'});//password not aupplier
    const newUser = User.register(user,'passw0rd');//set and hash password
    res.send(newUser);
    //user.save();
}) 

/register form
POST / register save
*/

app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes); //merge params pass in params from main file
app.use('/', userRoutes);

app.get('/', (req,res) =>{
    //res.send('Hello From Yelp Camp');
    res.render('home');
});

//Basic error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
});

app.listen(3000, ()=> {
    console.log('LISTENING ON PART 3000');
});