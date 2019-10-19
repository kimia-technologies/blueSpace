var express = require('express');
var router = express.Router();
var reservationApi = require('../api/reservation-manager');
var host = require('../config').serverHost;
var port = require('../config').serverPort;
var request = require('request');
var serviceKey = require('../config').serviceKey;
var QRCode = require('qrcode');

router.use(require('../api/rbac'));

router.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const rsvs = await reservationApi.getAll();
    res.status(200).json(rsvs);
  })
  .get('/my-books', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const rsvs = await reservationApi.getReservationOf(req.decoded.payload.email);
    res.status(200).json(rsvs);
  })
  .get('/r=:r/formule', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const f = await reservationApi.getFormule(req.params.r);
    res.status(200).json(f);
  })
  .get('/r=:r/services', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const servs = await reservationApi.getServices(req.params.r);
    const conso = await reservationApi.getConsommation(req.params.r);
    let out = [];
    let services = [];
    let nServ = [];
    let tmp;
    servs.map(s => {
      if (conso.length !== 0) {
        conso.forEach(c => {
          if (s.get('service').get('NOMSERVICE') === c.get('service').get('NOMSERVICE')) {
            if (s.get('QUANTITE') !== -1) {
              nServ.push(s.get('service').get('NOMSERVICE'));
              tmp = 100 - c.get('CONSOME') / c.get('QUANTITE') * 100;
              out.push({
                NOMSERVICE: s.get('service').get('NOMSERVICE'),
                QUANTITE: c.get('QUANTITE'),
                UNITE: s.get('service').get('UNITE'),
                CONSOME: c.get('CONSOME'),
                PROGRESSION: tmp
              });
            }
          }
        });
      }
    });
    servs.map(s => {
      if (!nServ.includes(s.get('service').get('NOMSERVICE')))
        services.push(s);
    });
    services.map(s => {
      out.push({
        NOMSERVICE: s.get('service').get('NOMSERVICE'),
        QUANTITE: -1,
        UNITE: s.get('service').get('UNITE'),
        CONSOME: -1,
        PROGRESSION: 100
      });
    });
    res.status(200).json(out);
  })
  .post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.headers.origin != 'http://127.0.0.1:1112') {
      await reservationApi.reserve(req.decoded.payload.email, req.body)
        .then(rsv => {
          res.status(rsv.status).json(rsv.reservation);
        })
        .catch(() => {
          res.status(500).json({
            msg: 'echec'
          });
        });
    } else {
      await reservationApi.reserve(req.body.e, req.body)
        .then(async rsv => {
          const state = await reservationApi.confirm(rsv.reservation);
          res.status(state).json();
        })
        .catch(() => {
          res.status(404).json({
            msg: 'utilisateur inexistant'
          });
        });
    }
  })
  .post('/verify', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const reserv = await reservationApi.verify(req.decoded.payload.email, req.body);
    res.status(reserv.state).json(reserv.reservation);
  })
  .post('/pay', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const state = await reservationApi.confirm(req.body.rsv);
    if (state === 200) {
      request({
        url: 'https://api.monetbil.com/widget/v2.1/' + serviceKey,
        method: 'POST',
        data: {
          phonenumber: req.body.t,
          amount: req.body.p,
          return_url: 'http://' + host + ':' + port
        }
      }, (err, response, body) => {
        if (err) res.status(state).json();
        else res.redirect(JSON.parse(body).payment_url);
      });
    } else res.status(state).json();
  })
  .post('enter/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const allow = await reservationApi.look_for(req.decoded.payload.email, req.body);
    if (allow == true) {
      const gen_code = QRCode.toDataURL();
      res.status(200).json(gen_code);
    } else {
      res.status(404).json();
    }
  })
  .delete('/r=:r', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await reservationApi.cancel(req.params.r);
    res.status(state).json({});
  })
  .patch('/renouveler', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const status = await reservationApi.renouveler(req.body.r);
    res.sendStatus(status);
  })
  .patch('/r=:r', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const update = await reservationApi.update({
      e: req.decoded.payload.email,
      r: req.params.r
    }, req.body);
    res.status(update.status).json(update.reservation);
  });

module.exports = router;