/**
 * Created by Wayne
 * roleauth Model
 */


const  mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

let roleauthSchema = new Schema({
    _id: {
        type: String,
        'default': shortid.generate
    },
    roleid:String,
    authid:String,
    update_time:{
        type: Date,
        "default": Date.now
    }
});

let role = mongoose.model('roleauth', roleauthSchema);

module.exports = role;
