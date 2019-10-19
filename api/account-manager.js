var crypto = require('crypto');
var db = require('../models/db').db;
var host = require('../config').serverHost;
var port = require('../config').serverPort;

var utilisateur = new db.utilisateur(db.sequelize, db.Sequelize);
var employe = new db.employe(db.sequelize, db.Sequelize);
var possede = new db.possede(db.sequelize, db.Sequelize);
var token = new db.token(db.sequelize, db.Sequelize);

exports.login = async function (params) {
  var id = params.id;
  var password = crypto.createHash('sha256').update(params.k, 'utf8').digest('hex');
  const user = await utilisateur.login({
      id: id,
      k: password
    })
    .then(u => {
	/*if(params.emp){
	   return await employe.search(u.get('EMAIL')).then(u => { if(u === null) console.log('errr'); else return u;}).catch(err => {throw err;});
	}*/
	return u;
    })
    .catch(err => {
      return null;
    });
  return user;
};

exports.createLink = async function (email, params) {
  const emp = await employe.search({
    email: email,
    site: params.s
  });
  const id = String(emp.get('IDEMPLOYE')).replace(/-/g, '');
  const user = emp.get('utilisateur');
  return {
    a: user.get('NOM') + ' ' + user.get('PRENOM'),
    link: 'http://' + host + ':' + port + '/invite.new/' + id
  };
};

exports.rlink = async function (link, full_link) {
  var found = {
	anim: null,
	state: 404
  };
  const emps = await employe.list();
  emps.forEach(async emp => {
    if (String(emp.get('IDEMPLOYE')).replace(/-/g, '') === link) {
      found = {
        anim: emp.get('EMAIL'),
        state: 200
      };
    }
  });
  return {
    state: found.state,
    a: found.anim,
    full_link: full_link
  };
};

var saveToken = async function (params) {
  return await token.create({
      EMAIL: params.e,
      ID: params.t
    })
    .then(t => {
      return t;
    })
    .catch(err => {
      throw err;
    });
};

exports.saveToken = saveToken;

exports.logout = async function (email) {
  const tk = await token.searchBy(email);
  return await token.invalidate(tk);
};

exports.newToken = async function (tk) {
  return await token.search(tk);
};

exports.listRoles = async (params) => {
  return await possede.listBy(params);
};

exports.register = async function (params, emp = false) {
  if (await utilisateur.isExists(params.e)) {
    return {
      status: 409,
      msg: 'email deja utilise'
    };
  } else if (await utilisateur.isExists(params.ps)) {
    return {
      status: 409,
      msg: 'pseudo deja utilise'
    };
  } else if (await utilisateur.isExists(params.t)) {
    return {
      status: 409,
      msg: 'telephone deja utilise'
    };
  }
  const code = Array.from({
    length: 4
  }, () => Math.floor(Math.random() * 10)).join('');
  const user = await utilisateur.create({
      EMAIL: params.e,
      NOM: params.n,
      PRENOM: params.p,
      SEXE: params.s,
      PHONE: params.t,
      PASSWORD: crypto.createHash('sha256').update(params.k, 'utf8').digest('hex'),
      PSEUDO: params.ps,
      CODE: code,
      NOMROLE: params.r
    })
    .then(async u => {
      if (emp) {
        return await employe.create({
          EMAIL: u.get('EMAIL'),
          NOMSITE: params.st
        });
      } else {
        await possede.create({
          NOMROLE: 'Client',
          EMAIL: u.get('EMAIL')
        });
        return {
          status: 200,
          code: u.get('CODE'),
          msg: 'success'
        };
      }
    })
    .catch(err => {
      return {
        status: 406,
        msg: 'Remplir tous les gens'
      };
    });
  return user;
};

exports.activate = async function (params) {
  const state = await utilisateur.activate(params.e, params.c)
    .then(out => {
      return {
        status: 200,
        msg: out
      };
    })
    .catch(err => {
      return {
        status: 500,
        msg: 'erreur lors du processus'
      };
    });
  return state;
};

exports.getAllUser = async function () {
  const users = await utilisateur.list();
  return JSON.stringify(users);
};

exports.getUser = async function (e) {
  return await utilisateur.search(e);
};

exports.delete = async function (e) {
  const state = await utilisateur.delete(utilisateur.search(e));
  return state;
};

exports.edit = async function (e, params) {
  if (params.ps === '')
    return {
      status: 400,
      msg: 'veuillez renseigner le pseudo'
    }
  const user = await utilisateur.search(e);
  return await utilisateur.edit({
      EMAIL: e,
      PSEUDO: params.ps,
      NOM: params.n,
      PRENOM: params.p,
      ETAT: 1,
      PASSWORD: user.get('PASSWORD'),
      PHONE: params.t,
      ENTREPRISE: params.en,
      ENTREROLE: params.f,
      ANNIV: params.d
    })
    .then(t => {
      return {
        status: 200,
        msg: 'succes'
      }
    })
    .catch(err => {
      return {
        status: 500,
        msg: 'echec pseudo ou telephone deja utilise'
      };
    });
};

exports.find = async function (id) {
  return await utilisateur.search(id);
};