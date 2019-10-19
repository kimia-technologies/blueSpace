'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Ressource = sequelize.define('ressource', {
    NOMRESSOURCE: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'ressource'
  });

  Ressource.associate = function (models) {
    Ressource.belongsToMany(models.role, {
      through: {
        model: 'permission',
        unique: false
      },
      foreignKey: 'NOMRESSOURCE'
    });
  };

  Ressource.prototype.list = function () {
    return Ressource.findAll();
  };

  Ressource.prototype.create = async function (ressource) {
    const tmp = Ressource.build(ressource);
    return await tmp.save()
      .then(r => {
        return;
      })
      .catch(err => {
        throw err;
      });
  };

  Ressource.prototype.delete = async function (ressource) {
    return ressource.destroy()
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  Ressource.prototype.update = async function (ressource, nom) {
    return ressource.update({
        NOM: nom
      })
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  return Ressource;
};