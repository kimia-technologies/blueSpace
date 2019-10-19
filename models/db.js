var config = require('../config').dbConfig;
var fs = require('fs');
var path = require('path');

//handling database
var Sequelize = require('sequelize');
var conection = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: config.type,
  dialectModulePath: 'mysql2'
});

var db = {
  Sequelize: Sequelize,
  sequelize: conection
};

fs.readdirSync(__dirname).filter(file => {
  return (file.indexOf(".") != 0) && (file !== "db.js");
}).forEach(file => {
  var model = conection.import(path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach((model) => {
  if ('associate' in db[model])
    db[model].associate(db);
});

db.sequelize.sync()
  .then(() => {
    console.log('successfull connected with database');
  })
  .catch(err => {
    console.log('failed to connect with database');
    throw err;
  });

exports.db = db;