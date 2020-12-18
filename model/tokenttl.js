/**
 * Created by Wayne
 * vps Model
 */


const  mongoose = require('mongoose'),
      shortid = require('shortid'),
       Schema = mongoose.Schema;

let tokenSchema = new Schema({
  _id: {
    type: String,
    'default': shortid.generate
  },
  name: {type:String ,unique: true},
  token:{type:String},
  createdAt: { type: Date, default: Date.now, index: { expires: 600 }}
});

let tokenttl = mongoose.model('token', tokenSchema);

module.exports = tokenttl;
