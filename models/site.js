'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Site = sequelize.define('site', {
    NOMSITE: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true
    },
    QUARTIER: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    DESCRIPTION: {
      type: DataTypes.STRING(15),
      allowNull: true,
      defaultValue: ''
    }
  }, {
    timestamps: false,
    tableName: 'site'
  });

  Site.associate = function (models) {
    Site.hasMany(models.employe, {
      foreignKey: 'NOMSITE'
    });
    Site.hasMany(models.espace, {
      foreignKey: 'NOMSITE'
    });
  };

  Site.prototype.list = function () {
    return Site.findAll({
      row: true
    });
  };

  Site.prototype.create = async function (site) {
    const tmp = Site.build(site);
    return await tmp.save()
      .then(t => {
        return t;
      })
      .catch(err => {
        return null;
      });
  };

  Site.prototype.update = function (site, params) {
    return site.update({
        QUARTIER: params.q,
        DESCRIPTION: params.d
      })
      .then(t => {
        return t;
      })
      .catch(err => {
        return null;
      });
  };

  Site.prototype.delete = async function (site) {
    return await site.destroy()
      .then(() => {
        return 204;
      })
      .catch(err => {
        return err;
      });
  };

  Site.prototype.search = function (nom) {
    return Site.findByPk(nom, {
      row: true
    });
  };

  return Site;
};