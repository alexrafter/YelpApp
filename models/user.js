const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    { //do not specify username and password
        email: {
            type: String,
            required: true,
            unique: true
        }
    }
);

UserSchema.plugin(passportLocalMongoose);
//will add username and password and ensures username is unique

module.exports = mongoose.model('User', UserSchema);