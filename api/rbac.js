var db = require('../models/db').db;
var permission = new db.permission(db.sequelize, db.Sequelize);
  
var rbac = async (req, res, next) => {
  const roles = req.decoded.payload.roles;
  let access;
  let auth = false;
  for (let index = 0; index < roles.length; index++) {
    let role = roles[index];
    access = await permission.search(role.NOMROLE, req.headers.ressource);
    if (access !== null) {
      if (access.get(req.headers['b-action'].toUpperCase()) === 1) {
        if (req.method === 'GET' && req.path === '/' && req.headers['b-action'].toUpperCase() !== 'READ_ALL');
        else auth = true;
      }
    }
  }
  if (auth) {
    res.status(200);
    next();
  } else res.sendStatus(400);
};

module.exports = rbac;