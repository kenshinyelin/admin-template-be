const express = require('express'),
    router = express.Router(),
    superagent = require('superagent'),
    tokenTtl = require("../model/tokenttl"),    
    util = require("../util/util"),
    crypto = require('crypto'),
    user = require("../model/user");


/* GET home page. */



router.post('/checklogin', function (req, res) {
    const objdata = {}
    const params = {
        name: req.body.username,
    }
    var reqpwd = req.body.password
    user.find(params, (err, results) => {
        if (err) {
            res.send(util.reObj(-1, 'failed', err))
        } else {
            if (results.length > 0) {
                let salt = util.randomString(8)
                let respwd = util.randomString(32)
                if (results[0].pwd) {
                    salt = results[0].pwd.substring(0, 8)
                    respwd = results[0].pwd.substring(8)
                }
                let password = crypto.createHash('md5').update(reqpwd + salt).digest('hex');
                if (password.toString() == respwd) {
                    let timestamp = new Date().getTime()
                    tokenTtl.findOneAndUpdate(params, {
                        createdAt: timestamp
                    }, null, function (err, response) {
                        if (!err && response) {
                            res.send(util.reObj(0, '用户身份验证成功', response))
                        } else {
                            const tokenObj = new tokenTtl({
                                name: req.body.username,
                                token: util.randomString(32)
                            });
                            tokenObj.save().then(results => res.send(util.reObj(0, '用户身份验证成功', results))).catch((err) => res.send(util.reObj(-1, '用户身份验证失败', err)));
                        }
                    })

                } else {
                    res.send(util.reObj(-1, '无效的密码', []))
                }

            } else {
                res.send(util.reObj(-1, '用户身份验证失败', err))
            }
        }
    })

})

router.get('/logout', async (req, res) => {
    res.send(util.reObj(0, 'success', ''))
})

router.get('/getheaders',function (req,res) {
    console.log('headers:'+req.headers)
        res.send(req.headers)
    })
    
module.exports = router;