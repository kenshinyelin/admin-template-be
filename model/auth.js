/**
 * Created by Wayne
 * auth Model
 */


const  mongoose = require('mongoose'),
    shortid = require('shortid'),
    Schema = mongoose.Schema;

let authSchema = new Schema({
    _id: {
        type: String,
        'default': shortid.generate
    },
    authid:String,//权限id
    authname:String,//权限名称
    authtype:String,//权限类型，F表示功能，M表示菜单
    authicon: String,//权限图标
    parentid:String,//
    authcomment:String,//注释
    authurl:String,//url
    status:String,//状态，1可用，0不可用
    sortid:String,//排序
    authflag:String,
    update_time:{
        type: Date,
        "default": Date.now
    }
});

let auth = mongoose.model('auth', authSchema);

module.exports = auth;
