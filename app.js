const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const nocache = require('nocache');
const dotenv = require('dotenv');
const passport = require('passport');
const passportConfig =require('./passport/index');
const {sequelize} = require('./models/index')
const path = require('path');
const pageRouter = require('./routes/page');
const userRouter = require('./routes/users');
const extinguisherRouter = require('./routes/extinguishers');


dotenv.config();
passportConfig();

const app = express();

app.set('port',process.env.PORT || 3000);
app.set('view engine','ejs');
app.set('views',__dirname+'/views');

sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(nocache());

app.use("/",pageRouter);
app.use("/users",userRouter);
app.use("/extinguishers",extinguisherRouter);

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error',{error:err});
  });

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
  });