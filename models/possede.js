'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Possede = sequelize.define('possede', {
    NOMROLE: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'role',
        key: 'NOMROLE'
      }
    },
    EMAIL: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'utilisateur',
        key: 'EMAIL'
      }
    }
  }, {
    tableName: 'possede'
  });

  Possede.associate = function (models) {
    Possede.belongsTo(models.role, {
      foreignKey: 'NOMROLE',
      targetKey: 'NOMROLE',
      as: 'role'
    });
    Possede.belongsTo(models.utilisateur, {
      foreignKey: 'EMAIL',
      targetKey: 'EMAIL',
      as: 'utilisateur'
    });
  };

  Possede.prototype.listBy = function (email) {
    return Possede.findAll({
      where: {
        EMAIL: email
      },
      attributes: ['NOMROLE'],
      row: true
    });
  };

  Possede.prototype.create = async function (possede) {
    const tmp = Possede.build(possede);
    return await tmp.save()
      .then(r => {
        return;
      })
      .catch(err => {
        throw err;
      });
  };

  Possede.prototype.search = function (role, email) {
    return Possede.findOne({
      where: {
        NOMROLE: role,
        EMAIL: email
      },
      row: true
    });
  };

  Possede.prototype.delete = async function (possede) {
    return possede.destroy()
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  return Possede;
};