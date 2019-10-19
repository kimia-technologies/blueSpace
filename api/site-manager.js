var db = require('../models/db').db;
var type = new db.type(db.sequelize, db.Sequelize);
var offre = new db.offre(db.sequelize, db.Sequelize);
var service = new db.service(db.sequelize, db.Sequelize);
var espace = new db.espace(db.sequelize, db.Sequelize);
var formule = new db.formule(db.sequelize, db.Sequelize);
var contient = new db.contient(db.sequelize, db.Sequelize);
var role = new db.role(db.sequelize, db.Sequelize);
var permission = new db.permission(db.sequelize, db.Sequelize);
var image = new db.image(db.sequelize, db.Sequelize);

var getAllType = async function () {
  return await type.list();
};

var getType = async function (t) {
  const tp = await type.search(t);
  const img = await image.list(t);
  return {
    IMAGES: img,
    INFO: tp
  };
};

var getImage = async function (t) {
  return await image.list(t);
};

var createType = async function (params) {
  return await type.create({
    NOMTYPE: params.n,
    CONTENANCE: params.c
  });
};

var deleteType = async function (params) {
  const t = await type.search(params.t);
  return await type.delete(t);
};

exports.getTypeFormule = async function (t, f) {
  const info = await offre.search(t, f);
  const tp = await type.search(t);
  const img = await image.list(t);
  return {
    IMAGES: img,
    INFO: tp,
    PRIX: info.get('PRIX')
  };
};
exports.getAllType = getAllType;
exports.getType = getType;
exports.getImage = getImage;
exports.createType = createType;
exports.deleteType = deleteType;

var getAllServices = async function (f = undefined) {
  if (f != undefined) {
    return await contient.list(f);
  }
  return await service.list();
};

var createService = async function (params) {
  return await service.create({
    NOMSERVICE: params.n,
    DESCRIPTION: params.d
  });
};

var deleteService = async function (params) {
  return await service.delete(await service.search(params.n));
};

exports.getAllServices = getAllServices;
exports.createService = createService;
exports.deleteService = deleteService;

var createOffre = async function (t, params) {
  return await offre.create({
    NOMTYPE: t.t,
    PRIX: params.p,
    IDFORMULE: params.f
  });
};

var deleteOffre = async function (t, f) {
  return await offre.delete(await offre.search(t.t, f.f));
};

exports.createOffre = createOffre;
exports.deleteOffre = deleteOffre;

var getAllSpaces = async function (type = undefined) {
  if (type != undefined)
    return await espace.listBy(type);
  return await espace.list();
};

var createSpace = async function (params) {
  return await espace.create({
    NOM: params.n,
    NOMTYPE: params.t,
    NOMSITE: params.s
  });
};

var deleteSpace = async function (params) {
  return await espace.delete(espace.search(params.s));
};

exports.getAllSpaces = getAllSpaces;
exports.createSpace = createSpace;
exports.deleteSpace = deleteSpace;

var getAllFormules = async function () {
  return await formule.list();
};

var getAllFormuleOf = async function (t) {
  return await offre.list(t);
};

var createFormule = async function (params) {
  return await formule.create({
    PERIODE: params.p
  });
};

var deleteFormule = async function (params) {
  return await formule.delete(formule.search(params.id));
};

var listDomiciliation = async function () {
  return await formule.listDomiciliation();
};

exports.getAllFormules = getAllFormules;
exports.createFormule = createFormule;
exports.deleteFormule = deleteFormule;
exports.getAllFormuleOf = getAllFormuleOf;
exports.listDomiciliation = listDomiciliation;

var createContent = async function (f, params) {
  return await contient.create({
    IDFORMULE: f.f,
    NOMSERVICE: params.s,
    NOMTYPE: params.t,
    QUANTITE: params.q
  });
};

var deleteContent = async function (params) {
  return await contient.delete(await contient.search(params.f, params.t));
};

exports.createContent = createContent;
exports.deleteContent = deleteContent;

var getRole = async function () {
  return await role.list();
};

var createRole = async function (nom) {
  return await role.create(nom);
};

var deleteRole = async function (nom) {
  return await role.delete(await role.search(nom));
};

var getPermission = async function (r) {
  return await permission.list(r);
};

var setPermission = async function (r, params) {
  return await permission.create({
      NOMROLE: r,
      NOMRESSOURCE: params.res
    })
    .then(() => {
      return 201;
    })
    .catch(err => {
      throw err;
    });
};

var rmvPermission = async function (params) {
  return await permission.delete(await permission.search(params.r, params.res));
};

exports.getRole = getRole;
exports.createRole = createRole;
exports.deleteRole = deleteRole;
exports.getPermission = getPermission;
exports.setPermission = setPermission;
exports.rmvPermission = rmvPermission;