'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Employe = sequelize.define('employe', {
    IDEMPLOYE: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    EMAIL: {
      type: DataTypes.STRING(128),
      allowNull: false,
      references: {
        model: 'utilisateur',
        key: 'EMAIL'
      }
    },
    NOMSITE: {
      type: DataTypes.STRING(128),
      allowNull: false,
      references: {
        model: 'site',
        key: 'NOMSITE'
      }
    }
  }, {
    tableName: 'employe'
  });

  Employe.associate = function (models) {
    Employe.belongsTo(models.utilisateur, {
      foreignKey: 'EMAIL',
      as: 'utilisateur'
    });
    Employe.belongsTo(models.site, {
      foreignKey: 'NOMSITE',
      targetKey: 'NOMSITE',
      as: 'site'
    });
  };

  Employe.prototype.list = function () {
    return Employe.findAll({
      include: [{
        all: true
      }],
      row: true
    });
  };

  Employe.prototype.create = async function (employe) {
    const tmp = Employe.build(employe);
    return await tmp.save()
      .then(t => {
        return t;
      })
      .catch(err => {
        throw err;
      });
  };

  Employe.prototype.update = function (employe, params) {
    return employe.update({
        NOMROLE: params.r,
        NOMSITE: params.s
      })
      .then(t => {
        return t;
      })
      .catch(err => {
        return null;
      });
  };

  Employe.prototype.delete = function (employe) {
    return employe.update({
        ETAT: 0
      })
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  Employe.prototype.search = async function (crd) {
    return await Employe.findOne({
      include: [{
	all: true
      }],
      where: {
        EMAIL: crd.email,
        NOMSITE: crd.site
      },
      row: true
    });
  };

  Employe.prototype.login = async function (email) {
    return await Employe.findOne({
        include: [{
          all: true
        }],
        where: {
          EMAIL: email
        },
        row: true
      })
      .then(t => {
        return t;
      })
      .catch(err => {
        return 404;
      });
  };

  return Employe;
};