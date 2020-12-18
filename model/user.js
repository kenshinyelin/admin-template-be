/**
 * Created by Wayne
 * user Model
 */


const  mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

let userSchema = new Schema({
    _id: {
        type: String,
        'default': shortid.generate
    },
    name:String,
    role:String,//角色
    nickname:String,
    pwd:String,
    phone:String,
    status: String,
    dtl:{//最后登录时间
        type: Date,
        "default": Date.now
    }
},{ timestamps:true });

let user = mongoose.model('user', userSchema);

module.exports = user;
