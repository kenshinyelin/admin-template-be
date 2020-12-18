/**
 * Created by Wayne
 * role Model
 */


const  mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

let roleSchema = new Schema({
    _id: {
        type: String,
        'default': shortid.generate
    },
    roleid:String,
    rolename:String,
    comment:String,
    created_time:{
        type: Date,
        "default": Date.now
    }
});

let role = mongoose.model('role', roleSchema);

module.exports = role;
