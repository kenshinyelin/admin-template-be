/*
 * Function:工具类函数
 * author:siwei
 * Data:2018-08-24
 */
const rootConfig = require('../config/rootConfig');

exports.reObj = reObj
exports.recursion = recursion
exports.randomString = randomString
exports.getcatlist = getcatlist
exports.sendMsg = sendMsg
exports.sendEmail = sendEmail
exports.checkMsg = checkMsg
exports.checkEmail = checkEmail
exports.modifyPwd = modifyPwd
exports.checkPwd = checkPwd
exports.regist = regist


//返回对象
function reObj(code, msg, data, rowcount) {
  return {
    code: code || 0,
    message: msg || '',
    data: data || '',
    total: rowcount
  }
}

//tree
function recursion(list, pid, attr) {
  // if(!attr){attr='authid'}
  let rtn = [];
  for (i in list) {
    if (list[i].parentid == pid) {
      rtn.push(list[i]);
      list[i].children = recursion(list, list[i][attr], attr);
    }
  }
  return rtn;
}

//随机字符串
function randomString(len) {
  len = len || 32;
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  const maxPos = $chars.length;
  let pwd = '';
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

//获取栏目数据（下属，递归调用）
function getcatlist(model, parentid, param, callback) {
  let arr = []
  model.findAll(param).then(record => {
    if (record.length > 0) {
      for (i in record) {
        arr.push(record[i]);
      }
      let tree = recursion(arr, parentid, 'catid');
      callback(null, reObj(0, '获取栏目数据成功', tree))
    } else {
      console.trace('报错位置');
      callback(reObj(0, '无效的参数', []), null);
    }
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
    callback(err, null);
  });
}

//注册用户
function regist(sequelize, usermodel, vipmodel, uuid, uname, utype, upwd, status, tel, mail, crypto, callback) {
  let salt = randomString(8)
  let password = salt + crypto.createHash('md5').update(upwd + salt).digest('hex');

  let params = {
    uuid: uuid,
    uname: uname,
    utype: utype,
    upwd: password,
    status: 1,
    tel: tel,
    mail: mail,
  }
  if (uname) {

    if (uname.length > 30 || utype.length > 30 || upwd.length > 50 || password.length > 50 || tel.length > 20) {
      callback(reObj(-1, '请求参数长度超出限制'), null)
    } else {

      usermodel.findOne({where: {uname:uname}}).then(record => {
        if (record) {
          callback(reObj(-1, '用户名已存在'), null)
        } else {

          // 创建事务
          sequelize.transaction(function (t) {
            // 在事务中执行操作
            return usermodel.create(params, {transaction:t})
              .then(function(user){
                return vipmodel.create({uuid: uuid, uname: uname, cardstatus: '0'}, {transaction:t})
              });
          }).then(function (results){
            /* 操作成功，事务会自动提交 */
            callback(null, reObj(0, '注册成功', results))
          }).catch(function(err){
            /* 操作失败，事件会自动回滚 */
            callback(reObj(-1, '注册失败', err), null)
          });

        }
      }).catch(err => {
        callback(reObj(-1, '注册失败', err), null, null)
      });

    }
  } else {
    callback(reObj(-1, 'uname不能为空'), null)
  }
}
//注册用户
/*function regist(usermodel, vipmodel, uuid, uname, utype, upwd, status, tel, mail, crypto, callback) {
  let salt = randomString(8)
  let password = salt + crypto.createHash('md5').update(upwd + salt).digest('hex');

  let params = {
    uuid: uuid,
    uname: uname,
    utype: utype,
    upwd: password,
    status: 1,
    tel: tel,
    mail: mail,
  }
  if (uname) {

    if (uname.length > 30 || utype.length > 30 || upwd.length > 50 || password.length > 50 || tel.length > 20) {
      callback(reObj(-1, '请求参数长度超出限制'), null)
    } else {
      usermodel.findOrCreate({where: {uname: uname}, defaults: params}).then(record => {
        if (record[1]) {
          //添加用户成功后接着添加会员
          vipmodel.create({
            uuid: uuid,
            uname: uname,
            cardstatus: '0'
          }).then(result => {
            callback(null, reObj(0, '注册成功', {user: record[0], vip: result}))
          }).catch(err => {
            callback(reObj(-1, '注册失败', err), null)
          });
        } else {
          callback(reObj(-1, '用户名已存在'), null)
        }
      }).catch(err => {
        callback(reObj(-1, '注册失败', err), null)
      });
    }
  } else {
    callback(reObj(-1, 'uname不能为空'), null)
  }
}*/


//验证密码
function checkPwd(model, uname, upwd, crypto, callback) {
  let objdata = {}
  let params = {
    uname: uname,
    status: 1
  }
  model.findOne({where: params}).then(record => {
    if (record) {
      let salt = record.upwd.substring(0, 8)
      let password = crypto.createHash('md5').update(upwd + salt).digest('hex');
      if (password.toString() == record.upwd.substring(8)) {
        objdata.uname = record.uname
        objdata.unickname = record.unickname
        objdata.utype = record.utype
        objdata.uuid = record.uuid
        callback(null, reObj(0, '用户身份验证成功', objdata), objdata)
      } else {
        callback(reObj(-1, '密码验证错误'), null, null)
      }
    } else {
      callback(reObj(-1, '无效的用户', []), null, null)
    }
  }).catch(err => {
    callback(reObj(-1, '用户身份验证失败', err), null, null)
  });
}

//修改密码
function modifyPwd(model, uname, upwd, redis, crypto, callback) {
  let params = {}

  if (uname && upwd) {
    params.uname = uname
    let updateparams = {}
    let salt = randomString(8)
    if (upwd != '') {
      updateparams.upwd = salt + crypto.createHash('md5').update(upwd + salt).digest('hex');
    }

    model.update(updateparams, {where: params}).then(record => {
      if (record[0] > 0) {
        callback(null, reObj(0, '修改密码成功', record[0]))
      } else {
        callback(reObj(-1, '无效的用户名', []), null)
      }
    }).catch(err => {
      callback(reObj(-1, '修改密码失败', err), null)
    });
  } else {
    callback(reObj(-1, 'uname,upwd不能为空'), null)
  }
}

//发送邮箱验证码
function sendEmail(model, uname, mail, redis, nodemailer, callback) {
  let params = {};
  if (uname && mail) {
    params.uname = uname;
    params.mail = mail;

    model.findOne({where: params}).then(record => {
      if (record) {
        let code = Math.ceil(Math.random() * 1000000);
        let text = rootConfig.mailtext_pre + code + rootConfig.mailtext_last;

        //set redis
        redis.set(mail, code, 'EX', rootConfig.mailTime);
        redis.get(mail, (err, result) => {  //find redis
          if (err) {
            callback(reObj(-1, '验证码发送失败', err), null)
          } else {
            if (result) {
              // 开启一个 SMTP 连接池
              let transporter = nodemailer.createTransport(rootConfig.nodemailerOption);
              let subject = rootConfig.mailSubject || text;
              console.log('subject:'+subject);
              // 设置邮件内容（谁发送什么给谁）
              let mailOptions = {
                from: '"'+rootConfig.mailer+'" <'+rootConfig.nodemailerOption.auth.user+'>', // 发件人
                to: mail,         // 收件人
                subject: subject, // 主题
                text: text,       // plain text body
                html: `<b>${text}</b>`, // html body
              };

              // 使用先前创建的传输器的 sendMail 方法传递消息对象
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  callback(reObj(-1, '验证码发送失败', error), null)
                  return console.log(error);
                } else {
                  callback(null, reObj(0, '验证码发送成功'))
                }
              });
            }
          }
        });
      } else {
        callback(reObj(-1, '用户名和邮箱号不对应,请检查是否有误'), null)
      }
    }).catch(err => {
      callback(reObj(-1, '验证码发送失败', err), null);
    });
  } else {
    callback(reObj(-1, '用户名和邮箱号不能为空'), null);
  }
}

//发送短信验证码
function sendMsg(model, uname, tel, redis, request, callback) {
  let params = {};

  if (uname && tel) {
    params.uname = uname;
    params.tel = tel;

    model.findOne({where: params}).then(record => {
      if (record) {
        let code = Math.ceil(Math.random() * 1000000);
        // 短信内容
        let text = encodeURI(rootConfig.msgtext_pre + code + rootConfig.msgtext_last);
        let baseUrl = rootConfig.msgOption.baseUrl;
        let paramsNames = rootConfig.msgOption.params;
        let url = baseUrl + '&' + paramsNames[0] + '=' + params.tel + '&' + paramsNames[1] + '=' + text;

        //设置redis
        redis.set(params.tel, code, 'EX', rootConfig.msgTime);
        redis.get(params.tel, (err, result) => {
          if (err) {
            callback(reObj(-1, '验证码发送失败', err), null)
          } else {
            if (result) {
              request.get({url: url}, (error, response, body) => {
                if (error) {
                  callback(reObj(-1, '验证码发送失败', error), null)
                } else {
                  callback(null, reObj(0, '验证码发送成功'))
                }
              })
            }
          }
        });
      } else {
        callback(reObj(-1, '用户名和手机号不对应,请检查是否有误'), null)
      }
    }).catch(err => {
      callback(reObj(-1, '验证码发送失败', err), null);
    });
  } else {
    callback(reObj(-1, '用户名和手机号不能为空'), null);
  }
}

//验证邮件验证码
function checkEmail(mail, msgcode, redis, callback) {
  redis.get(mail, (err, result) => {
    if (err) {
      callback(reObj(-1, '验证码验证失败', err), null)
    } else {
      if (result) {
        if (msgcode == result) {
          callback(null, reObj(0, '验证码正确'))
        } else {
          callback(reObj(-1, '验证码错误'), null)
        }
      } else {
        callback(reObj(-1, '验证码已失效'), null)
      }
    }
  });
}

//验证短信验证码
function checkMsg(tel, msgcode, redis, callback) {
  redis.get(tel, (err, result) => {
    if (err) {
      callback(reObj(-1, '验证码验证失败', err), null)
    } else {
      if (result) {
        if (msgcode == result) {
          callback(null, reObj(0, '验证码正确'))
        } else {
          callback(reObj(-1, '验证码错误'), null)
        }
      } else {
        callback(reObj(-1, '验证码已失效'), null)
      }
    }
  });
}
