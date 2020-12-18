/**
 *  auth: Wayne
 *  function: 用户接口
 * */

let express = require('express');
let router = express.Router();
let user = require("../model/user");
let util=require("../util/util");
let crypto = require('crypto');

/**
 * @function 新增用户
 * @author wayne
 * @date 2017-11-2
 * @param name
 */
router.post('/add',function (req,res) {
    const newObj = new user(req.body);
    let name = req.body.name;
    let pwd = crypto.createHash('md5').update("123456").digest('hex');;//req.body.upwd;
    let salt = util.randomString(8)
    let password = salt + crypto.createHash('md5').update(pwd + salt).digest('hex');


    newObj.pwd=password;
    let findparams={
        name:name
    }
    if(name){
        user.find(findparams, (err,results)=> {
            if(err){
                res.send(util.reObj(-1,'failed',err))
            }else {
                if(results.length>0){
                    res.send(util.reObj(-2,'exist'))
                }else{
                    newObj.save( (err, result)=>{
                        if(err){
                            res.send(util.reObj(-1,'add user failed'))
                        }else{
                            res.send(util.reObj(0,'add user success',result))
                        }
                    })
                }
            }
        })
    }else{
        res.send(util.reObj(-1,'用户名不能为空'))
    }


})
/**
 * @function 删除用户
 * @author wayne
 * @date 2017-11-20
 * @param
 */
router.post('/del',function (req,res) {
    let userid = req.body.userid,
        params={
            _id:userid
        };
    if(userid) {
        user.remove(params,(err,result)=>{
            if (err) {
                res.send(util.reObj(-1,'del error'))
            }
            else {
                res.send(util.reObj(0,'success'))
            }
        })

    }else{
        res.send(util.reObj(-1,'id can not be null'))
    }

})
/**
 * @function 查询用户
 * @author wayne
 * @date 2017-11-20
 * @param
 */
router.get('/find',async (req,res)=>{
    let param={},
        pagenum=req.query.pagenum||1,
        pagesize=req.query.pagesize||10;

    const reg = new RegExp(req.query.phone, 'i') //不区分大小写
    if(req.query.phone)
    {
        param.phone={$regex : reg}
    }

    try {
        const results = await user.find(param,null,{skip: parseInt((pagenum-1)*pagesize), limit:parseInt(pagesize),sort: {createdAt: -1}})
        const count =await user.count(param,null,{skip: parseInt((pagenum-1)*pagesize), limit:parseInt(pagesize),sort: {createdAt: -1}})
        res.send(util.reObj(0,'success',results,count))
    }
    catch (err) {
        res.send(util.reObj(-1,'failed',err))
    }
})
/**
 * @function 修改用户
 * @author wayne
 * @date 2017-11-20
 * @param
 */
router.post('/update',function (req,res) {
    let _id = req.body.userid,
        phone = req.body.phone,
        username = req.body.uname||'',
        password = req.body.upwd||'',
        nickname=req.body.unickname||'',
        utype=req.body.utype||'',
        status = req.body.status||'';

    let findparams={
        _id:_id
    }
    let updateparams={
        phone:phone,
        utype:utype,
        unickname:nickname,
        uname:username,
        upwd:password,
        dtl:Date.now(),
        status:status
    }
    for (var key of Object.keys(updateparams)) {
        if(!updateparams[key])
            delete updateparams[key]
    }
    if(_id){
        user.findOneAndUpdate(findparams,{$set:updateparams},function (err,result) {
            if(err){
                res.send(util.reObj(-1,'failed',err))
            }else{
                res.send(util.reObj(0,'success',result))
            }
        })
    }else{
        res.send(util.reObj(-1,'userid can not be null,undefined,empty'))
    }
})

/**
 * @function 用户密码重置接口(后台)
 * @author Wyane
 * @date 2018-11-30
 * @param uuid,upwd
 */
router.post('/reset', (req, res) => {
    let params = {}
    let _id = req.body._id
    let upwd = req.body.upwd
    if (_id && upwd) {
        params._id = _id
        let updateparams = {
            upwd: upwd,
        }
        let salt = util.randomString(8)
        if (upwd != '') {
            updateparams.upwd = salt + crypto.createHash('md5').update(req.body.upwd + salt).digest('hex');
        }
        user.findOneAndUpdate(params,{$set:updateparams},function (err,result) {
            if(err){
                res.send(util.reObj(-1,'failed',err))
            }else{
                res.send(util.reObj(0,'重置密码成功',result))
            }
        })
    } else {
        res.send(reObj(-1, 'uuid,upwd不能为空'))
    }
})


router.get('/info',async (req,res)=>{
    let obj=""
    if(req.query.token==='admin')
    {
        obj={roles: ['admin']}
    }
    else
    {
        obj={roles: ['editor']}
    }
    res.send(util.reObj(0,'success',obj))


})

router.get('/logout',async (req,res)=>{
    res.send(util.reObj(0,'success',''))


})

module.exports = router;
