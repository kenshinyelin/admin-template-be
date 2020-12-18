/**
 * Created by Eric_HSBC on 16-6-26.
 * 登录验证
 */

var express = require('express');
var router = express.Router();
let token = require("../model/tokenttl");
let util=require("../util/util");


router.all("/*", function (req, res, next) {
  let query={token:req.headers.kctoken}
  let timestamp=new Date().getTime()
  token.findOneAndUpdate(query ,{createdAt:timestamp}, null, function(err,response){
    if(!err&&response)
    {
      next()
    }
    else
    {
      res.send(util.reObj(-1,'会话超时，请重新登录',err))
    }
  })

});

module.exports = router;
