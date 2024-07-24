const mongoose = require('mongoose');
const cities = require('./cities'); 
const Campground = require('../models/campground');
const {descriptors, places} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "DB Connection error:")); //on error
db.once("open", () =>{ //sucess fully opened
    console.log("DB Connected");
});

//array[Math.floor(Math.random() * array.length)] random entry in an array
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});//empty DB
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000) + 1;
        const price = Math.floor(Math.random() * 100) +1; 
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            //image: `https://picsum.photos/400?random=${Math.random()}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
                //coordinates: [-113.1331, 47.0202]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ddubxrhoy/image/upload/v1721738887/YelpCamp/w9pi2jykzmvcnr7jvxc0.jpg',
                    filename: 'YelpCamp/w9pi2jykzmvcnr7jvxc0'
                },
                {
                    url: 'https://res.cloudinary.com/ddubxrhoy/image/upload/v1721738888/YelpCamp/xy1okau5rb4pqzt5fi98.jpg',
                    filename: 'YelpCamp/xy1okau5rb4pqzt5fi98'
                }
            ],
            price: price,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Modi earum facere iusto blanditiis sequi accusamus cum praesentium pariatur laborum aliquid eaque voluptatem aspernatur, molestias quam ipsam vero officiis quibusdam cupiditate!',
            author: '669e465de003b70c979d49b5'
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});