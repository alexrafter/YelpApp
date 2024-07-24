const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema(
    {
        url: String,
        filename: String
    }
);

ImageSchema.virtual('thumbnail').get(function() { //virtual property has callback function
    return this.url.replace('/upload', "/upload/w_200");
})

const opts = { toJSON: { virtuals: true } };//include virtual fields in JSON

const CampgroundSchema = new Schema(
    {
        title: String,
        price: Number,
        description: String,
        //image: String,
        images: [ImageSchema],
        geometry: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        location: String,
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Review'
            }
        ],
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
, opts); //include virtual fields in JSON

//by default when converting to JSON mongoose does not include virtuals
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

//findByIdAndDelete triggers middleware findOneAndDelete
CampgroundSchema.post('findOneAndDelete', async function(doc){
    //post deletion, deleted doc passed in
    //console.log("Deleted");
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);