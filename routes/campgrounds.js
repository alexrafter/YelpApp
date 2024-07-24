const express = require('express');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage: storage});
//const upload = multer({dest: "uploads/"}); //upload location
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
//const ExpressError = require('../utils/ExpressError');
//const { campgroundSchema} = require('../schema.js');
//const Campground = require('../models/campground');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const campgrounds  = require('../controllers/campgrounds');
//CONTROLLER PATTERNS a la MVC
//npm i multer
//multer middleware upload.single('image') upload.array('image') 'image' match form field
//populate req.body
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
    //.post(upload.array('image'), (req, res) => {
        //res.send(req.body);
        //console.log(req.body, req.files);
        //res.send('It worked');
    //});
    //.post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
//router.get('/',  catchAsync(campgrounds.index));
//router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
//must be before /campgrounds/:id

router.get('/new',  isLoggedIn, catchAsync(campgrounds.renderNewForm));//must be before rount /:id

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
//router.get('/:id', catchAsync(campgrounds.showCampground));
//make sure author is match logged in user
//router.put('/:id',isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));
//update to remove reviews attached
//router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
router.get('/:id/edit',  isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;