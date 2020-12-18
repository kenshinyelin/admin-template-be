const createError = require('http-errors'),
  express = require('express'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  compression = require('compression'),
  mongoose = require('mongoose'),
  rootConfig = require('./config/rootConfig'),
  validate = require('./routes/validate'),
  indexRouter = require('./routes/index'),
  usersRouter = require('./routes/users'),
  acc = require('./routes/acc'),
  app = express();
mongoose.set('useCreateIndex', true)//要修复弃用警告
//mongoose.connect(rootConfig.mongooseDbUrl,{ useNewUrlParser: true ,useUnifiedTopology:true});//链接数据库
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compression({
  level: 9
})); //优化压缩静态资源, 需要位于 express.static 前面，否则不起作用
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/',index);
app.use('/',validate); //验证token是否超时
app.use('/', indexRouter);
app.use('/acc', acc);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;