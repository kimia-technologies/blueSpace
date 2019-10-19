var express = require('express');
var jwt = require('jsonwebtoken');
var randtoken = require('rand-token');
var accountController = require('./routes/account-controller');
var reservationController = require('./routes/reservation-controller');
var siteController = require('./routes/site-controller');
var nodemailer = require('nodemailer');
var checkEmail = require('email-existence');
var user = require('./user');

const router = express.Router();

var mail = async function (rcv, code) {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: user.account, // generated ethereal user
      pass: user.pass // generated ethereal password
    }
  });
  await transporter.sendMail({
    from: user.account, // sender address
    to: rcv, // list of receivers
    subject: 'Register code', // Subject line
    text: 'Your register code. will be use one time for account activation', // plain text body
    html: '<b>Thanks for joining our community</b><br><div style="color:grey">This is your confirmation code to continue</div><br><center><div style="width: 50px; font-size: 18px; background-color:silver">' + code + '</div></center>'
  }, (err, info) => {
    if (err) throw err;
  });
};

var createRefreshToken = async function (email) {
  var refreshToken = randtoken.uid(255);
  return await accountController.saveToken({
      e: email,
      t: refreshToken
    })
    .then(() => {
      return refreshToken;
    })
    .catch(async err => {
      return await createRefreshToken(email);
    });
};

router.get('/type/:t', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const type = await siteController.getTypeInfo(req.params.t);
    res.status(200).json(type);
  })
  .get('/type/info/:t/:f', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const infos = await siteController.getTypeFormule(req.params.t, req.params.f);
    res.status(200).json(infos);
  })
  .get('/types', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const types = await siteController.getAllTypes();
    res.status(200).json(types);
  })
  .get('/domiciliation', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const fs = await siteController.getDomiciliation();
    res.status(200).json(fs);
  })
  .get('/formules/:t', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const formules = await siteController.getServiceByType(req.params.t);
    res.status(200).json(formules);
  })
  .get('/values/:f', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const services = await siteController.getOffer(req.params.f);
    res.status(200).json(services);
  })
  .post('/login', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

   if (req.headers.origin != 'http://127.0.0.1:1112') {
	req.body['emp'] = true;
   }
    await accountController.login(req.body)
      .then(async user => {
        if (user != null) {
          const allRoles = await accountController.listRoles(user.get('EMAIL'));
          const payload = {
            email: user.get('EMAIL'),
            pseudo: user.get('PSEUDO'),
            roles: allRoles,
            check: true
          };
          var token = jwt.sign(payload, 'kimiathanksforbluespace', {
            expiresIn: '1800s'
          });
          const refreshToken = await createRefreshToken(user.get('EMAIL'));
          res.status(200).json({
            user: payload,
            token: token,
            refreshToken: refreshToken
          });
        } else res.status(404).json({
          msg: 'identifiants incorrects ou compte inactif'
        });
      })
      .catch(err => {
        res.status(550).json({
          msg: 'veuillez remplir les champs'
        });
      });
  })
  .post('/token', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const rToken = await accountController.newToken(req.body.t);
    if (rToken !== null) {
      const user = rToken.get('utilisateur');
      if (user.get('EMAIL') === req.body.e) {
        const allRoles = await accountController.listRoles(user.get('EMAIL'));
        const payload = {
          email: user.get('EMAIL'),
          pseudo: user.get('PSEUDO'),
          roles: allRoles,
          check: true
        };
        var token = jwt.sign(payload, 'kimiathanksforbluespace', {
          expiresIn: '1800s'
        });
        res.status(200).json({
          user: payload,
          token: token
        });
      } else res.status(404).json();
    } else res.json(403).json();
  })
  .post('/signIn', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    checkEmail.check(req.body.e, async (err, rep) => {
      if (rep) {
        const out = await accountController.register(req.body);
        if (out.status === 200) {
          await mail(req.body.e, out.code);
        }
        res.status(out.status).json({
          msg: out.msg
        });
      } else res.status(404).json({
        msg: 'Email inexistant'
      });
    });
  })
  .post('/activate/account', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const out = await accountController.activate(req.body);
    res.status(out.status).json({
      msg: out.msg
    });
  });

router.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');

    var token = null;
    if (req.headers.authorization !== undefined)
      token = req.headers.authorization.split(' ')[1];
    if (token != null) {
      jwt.verify(token, 'kimiathanksforbluespace', {
        complete: true
      }, (err, decoded) => {
        if (err) {
          res.status(403).json();
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.sendStatus(401);
    }
  })
  .post('/logout', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await accountController.logout(req.decoded.payload.email);
    res.status(state).json({});
  })
  .use('/reservation', reservationController)
  .use('/account', accountController.route)
  .use((req, res, next) => {
    res.status(404).send('not found');
  });

exports.route = router;