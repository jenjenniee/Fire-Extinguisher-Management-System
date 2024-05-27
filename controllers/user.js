const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');
const Extinguisher = require('../models/extinguisher');

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { nick } });
    if (exUser) {
      return res.redirect('/?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return res.redirect(`/?error=${error}`);
  }
}

exports.login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?error=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }

      return res.redirect('/extinguisher/management');

    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};

exports.management = async (req,res)=>{
  try{
    let extinguishers = await Extinguisher.findAll(
      {where:{UserId:req.user.id}}
    );
    extinguishers = extinguishers.map((el)=>{
        return el.dataValues;
    });
    extinguishers=JSON.stringify(extinguishers);
    console.log(extinguishers);
    res.render('users/management',{extinguishers});
  }catch(err){
    console.error(err);
    next(err);
  }
};
