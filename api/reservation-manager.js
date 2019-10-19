var db = require('../models/db').db;

var reservation = new db.reservation(db.sequelize, db.Sequelize);
var espace = new db.espace(db.sequelize, db.Sequelize);
var contient = new db.contient(db.sequelize, db.Sequelize);
var formule = new db.formule(db.sequelize, db.Sequelize);
var type = new db.type(db.sequelize, db.Sequelize);
var consommation = new db.consommation(db.sequelize, db.Sequelize);

var getReservation = async function (typeL, jour) {
  const reservations = await reservation.listValide();

  return reservations.filter(rsv => {
    return (rsv.get('espace').get('NOMTYPE') === typeL) && (rsv.get('JOUR') === jour);
  });
};

var prepareReservation = async function (e, params) {
  let spaces = [];
  let state;
  let create = true;
  let occpSpace = [];
  let dSpace;

  const cFormule = await formule.search(params.f);
  const reservations = await getReservation(params.t, params.j);
  var espaces = {};
  const tabs = await espace.list();
  tabs.forEach(es => {
    espaces[es.get('NOMTYPE')] = es.get('type').get('CONTENANCE');
  });

  if (reservations.length == 0) {
    spaces = await espace.listBy(params.t);
    const freeSpace = spaces.filter(s => {
      return (s.get('CONCERNE') + parseInt(params.i)) <= s.get('type').get('CONTENANCE') && s.get('OCCP') === 0;
    });
    if (freeSpace.length != 0) {
      dSpace = freeSpace.pop().get('NUMESPACE');
    } else {
      create = false;
      state = 404;
    }
  } else {
    reservations.forEach(async rsv => {
      occpSpace.push(rsv.get('espace').get('NUMESPACE'));
      if (rsv.get('utilisateur').get('EMAIL') == e && rsv.get('formule').get('IDFORMULE') == params.f &&
        rsv.get('espace').get('NOMTYPE') == params.t && (rsv.get('TRANCHE') !== null && rsv.get('TRANCHE') === params.h && rsv.get('ETAT') !== 0)) {
        state = 409;
        create = false;
      }
    });
    if (create) {
      let space = reservations.filter(rsv => {
        return (rsv.get('espace').get('CONCERNE') + parseInt(params.i)) <= espaces[rsv.get('espace').get('NOMTYPE')] && rsv.get('espace').get('OCCP') === 0;
      });
      if (space.length != 0) {
        dSpace = space.pop().get('NUMESPACE');
        create = true;
      } else {
        spaces = await espace.listBy(params.t);
        space = spaces.filter(s => {
          return !occpSpace.includes(s.get('NUMESPACE')) && s.get('OCCP') === 0;
        });
        if (space.length != 0) {
          dSpace = space.pop().get('NUMESPACE');
          create = true;
        } else {
          create = false;
          state = 404;
        }
      }
    }
  }
  if (create) {
    let exp = null;
    if (cFormule.get('UNITE') === 'H') {
      const tmp = new Date(params.j).toLocaleDateString().split('-');
      const fin = params.h.split('-')[1];
      exp = new Date(tmp[0], tmp[1] - 1, tmp[2], fin.substr(0, fin.lastIndexOf('h')), 0, 0);
    } else {
      exp = new Date(params.j);
      exp.setHours(exp.getHours() + 24 * parseInt(cFormule.get('PERIODE')));
      exp.setHours(parseInt(params.h));
    }
    return {
      create: true,
      state: 200,
      exp: new Date(exp),
      dSpace: dSpace,
      cFormule: cFormule
    };
  }
  return {
    create: false,
    state: state
  };
};

var reserve = async function (e, params) {
  var prepared = await prepareReservation(e, params);
  var state;
  let servs = [];
  if (prepared.create) {
    state = await reservation.create({
        EMAIL: e,
        NUMESPACE: prepared.dSpace,
        IDFORMULE: prepared.cFormule.get('IDFORMULE'),
        EXPIRE: prepared.exp,
        NBINVITE: params.i,
        JOUR: params.j,
        MOIS: new Date(params.j).getMonth(),
        ANNEE: new Date(params.j).getFullYear(),
        TRANCHE: params.h
      })
      .then(async r => {
        const tmp = await contient.list(prepared.cFormule.get('IDFORMULE'));
        tmp.map(s => {
          servs.push({
            NOMSERVICE: s.get('NOMSERVICE'),
            IDRESERVATION: r.get('IDRESERVATION'),
            QUANTITE: s.get('QUANTITE'),
            JOUR: r.get('JOUR'),
          });
        });
        await consommation.create(servs);
        return {
          status: prepared.state,
          reservation: r.get('IDRESERVATION')
        };
      })
      .catch(err => {
        throw err;
      });
  } else {
    throw err;
  }
  return state;
};

var confirm = async function (r) {
  const rsv = await reservation.search(r);
  reservation.valide(rsv);
  if (rsv.get('espace').get('NOMTYPE') !== 'Open Space')
    await espace.occp(rsv.get('espace'));
  return await espace.addUser(rsv.get('espace'), rsv.get('NBINVITE'));
};

var getServices = async function (r) {
  const rsv = await reservation.search(r);
  return await contient.list(rsv.get('formule').get('IDFORMULE'));
};

var getConsommation = async function (r) {
  return await consommation.list(r);
};

var getAll = async function () {
  return await reservation.listValide();
};

var getReservationOf = async function (email) {
  return await reservation.listOf(email);
};

var getFormule = async function (r) {
  const rsv = await reservation.search(r);
  return rsv.get('formule');
};

var renouveler = async function (r) {
  const rsv = await reservation.search(r);
  const consom = await consommation.list(r);
  const servs = await contient.list(rsv.get('formule').get('IDFORMULE'));
  let cons = [];
  consom.map(c => {
    servs.forEach(s => {
      if (s.get('NOMSERVICE') === c.get('NOMSERVICE')) {
        cons.push({
          NOMSERVICE: c.get('NOMSERVICE'),
          IDRESERVATION: r,
          QUANTITE: c.get('QUANTITE') + s.get('QUANTITE'),
          ETAT: 1,
        });
      }
    });
  });
  return await consommation.renouveler(cons);
};

var cancel = async function (r, u = false) {
  const rsv = await reservation.search(r);
  if (rsv.get('ETAT') === 1)
    return 405;
  return await reservation.invalide(rsv, u)
    .then(async () => {
      return await espace.rmvUser(await espace.search(rsv.get('NUMESPACE')), rsv.get('NBINVITE'));
    })
    .catch(err => {
      return 404;
    });
};

var update = async function (initParams, params) {
  const p = {
    t: params.t,
    j: params.j,
    i: params.i,
    f: params.f
  };
  const prepared = await prepareReservation(initParams.e, p);
  if (prepared.create) {
    return await cancel(initParams.r, true)
      .then(async (state) => {
        return await reserve(p);
      })
      .catch(err => {
        throw err;
      });
  }
  return {
    status: 404 | 500,
    reservation: []
  };
};

var look_for = async function (e, params) {
  return {};
};

exports.reserve = reserve;
exports.verify = prepareReservation;
exports.confirm = confirm;
exports.look_for = look_for;
exports.getAll = getAll;
exports.getReservationOf = getReservationOf;
exports.cancel = cancel;
exports.update = update;
exports.getServices = getServices;
exports.getConsommation = getConsommation;
exports.renouveler = renouveler;
exports.getFormule = getFormule;