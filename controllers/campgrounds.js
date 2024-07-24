const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req,res) =>{
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = async (req,res) =>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    //const campground = new Campground(req.body.campground);
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry; //GeoJSON returned a standard
    campground.images =  req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Sucessfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground= async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');//path: pass in object for reviews / review author
    //console.log(campground);
    if(!campground){
        req.flash('error','Campground not found');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','Campground not found');
        res.redirect('/campgrounds');
    }
    /*
    if(!campground.author.equals(req.user.id)){
        req.flash('error','You do not have permission to do that');
        return res.redirect(`/campgrounds/${req.params.id}`);//return make sure rest does not run
    }*/
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    /*const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user.id)){
        req.flash('error','You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);//return make sure rest does not run
    }*/
    //console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campground.geometry = geoData.features[0].geometry;
    const images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...images);
    await campground.save();
    if(req.body.deleteImages){ 
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images:{filename: {$in: req.body.deleteImages}}}});
       //console.log(campground);
    }
    req.flash('success','Successfully updated camp ground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}
/*
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));*/

//new callback valiidation validateCampground 
//app.post('/campgrounds',   validateCampground, catchAsync(async (req,res, next) =>{
    //try{
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    //res.send(req.body); //empty by default
    /*const campgroundSchema = Joi.object({ //not mongoose schema
        //validates before sent to mongoose
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0)
            
        }).required()
    });
    const error = campgroundSchema.validate(req.body);
    //console.log(result);
    if(error){
        const msg = error.details.map(el => el.message).join(', ');//error string
        throw new ExpressError(msg, 400);
    }*/
   // const campground = new Campground(req.body.campground);
    //await campground.save();
    //const campgrounds = await Campground.find({});
    //save 
    //res.render('campgrounds/show', {campground});
    //res.redirect(`/campgrounds/${campground._id}`)
   // }
   // catch(e) {
   //     next(e);
   // }

//}));*/

/*
app.get('/makecampground', async (req,res) =>{
    const camp = new Campground({title: 'My backyard',description: 'Cheap camping'});
    await camp.save();
    res.send(camp);
    //res.render('home');
})*/

