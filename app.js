var express = require('express');
var body = require('body-parser');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var redis = require('redis');
var nodemailer = require('nodemailer');
var checkEmail = require('email-existence');
var cors = require('cors');
var accountApi = require('./api/account-manager');
var accountController = require('./routes/account-controller');
var user = require('./user');

var route = require('./index');
// const client = redis.createClient(6379, '127.0.0.1');

const PORT = 8080;

var app = express();
app.use(body.json());
app.use(body.urlencoded({
  extended: true
}));

var mail = async function (params) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: user.account, // generated ethereal user
      pass: user.pass // generated ethereal password
    }
  });
  await transporter.sendMail({
    from: user.account, // sender address
    to: params.rcv, // list of receivers
    subject: 'Invitation', // Subject line
    text: 'Follow this link to join our community', // plain text body
    html: '<b>Mr ' + params.n + '</b><div style="color:grey">Follow this link to join our community</div><br><span style="font-size: 18px; background-color:silver">' + params.link + '</span><p><i>' + params.a + '</i></p>'
  }, (err, info) => {
    if (err) throw err;
  });
};

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
  methods: 'GET, PATCH, POST, DELETE',
  allowedHeaders: ['Content-Type, Authorization, b-action, ressource']
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

var auth = function (req, res, next) {
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
};

app.get('/invite.new/:link', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const out = await accountController.rlink(req.params.link, req.url);
  res.status(out.state).json({
    a: out.a,
    link: out.full_link
  });
}).post('/invite.new', auth, async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const out = await accountApi.createLink(req.decoded.payload.email, req.body);
  checkEmail.check(req.body.p, async (err, rep) => {
    if (err)
      res.status(404).json({
        msg: 'email inexistant'
      });
    if (rep) {
      await mail({
        rcv: req.body.p,
        n: req.body.n,
        a: out.a,
        link: out.link
      });
    }
  });
  if (out.link !== undefined) {
    res.status(200).json({
      msg: 'invitation envoy�e'
    });
  } else res.status(550).json({
    msg: 'email inexistant'
  });
});

app.use('/api.blueworks', route.route);

app.get('/', async (req, res) => {
  let images = [];
  // client.get('img', (err, imgs) => {
  //   if(err) throw err;
  //   if(imgs) {
  //     images = JSON.parse(imgs);
  //   }
  //   else {
      const baseUrl = 'http://41.205.23.56/blueworks/images/';
      fs.readdirSync('/var/www/blueworks/images').filter(file => {
        return (file.indexOf(".") != 0) && (file !== "*.*");
     }).forEach(file => {
          images.push(baseUrl + file);
     });
      // client.set('img', JSON.stringify(images));
    // }
      let out = [];
      let pos = [];
      var tmp;
      var i = 0;
      while(i<5){
        tmp = Math.floor(Math.random()*images.length);
        if (!pos.includes(tmp)) {
          pos.push(tmp);
          i++;
        }
      }
      for (let i=0, k=0; i<images.length && k<pos.length; i++, k++){
        out.push({url: images[pos[k]]});
      }
     res.status(200).json(out);
  // });
});

app.listen(PORT,
  console.log(`waiting for connection on ${PORT}...`));
