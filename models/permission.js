'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Permission = sequelize.define('permission', {
    NOMROLE: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'role',
        key: 'NOMROLE'
      }
    },
    NOMRESSOURCE: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'ressource',
        key: 'NOMRESSOURCE'
      }
    },
    CREATE: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    },
    READ: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    },
    UPDATE: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    },
    DELETE: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    },
    READ_ALL: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    }
  }, {
		timestamps: false,
    tableName: 'permission'
  });

  Permission.associate = function (models) {
    Permission.belongsTo(models.ressource, {
      foreignKey: 'NOMRESSOURCE',
      targetKey: 'NOMRESSOURCE',
      as: 'ressource'
    });
    Permission.belongsTo(models.role, {
      foreignKey: 'NOMROLE',
      targetKey: 'NOMROLE',
      as: 'role'
    });
  };

  Permission.prototype.list = function (r) {
    return Permission.findAll({
      include: [{
        all: true
      }],
      where: {
        NOMROLE: r
      },
      row: true
    });
  };

  Permission.prototype.create = async function (permission) {
    const tmp = Permission.build(permission);
    return await tmp.save()
      .then(r => {
        return;
      })
      .catch(err => {
        throw err;
      });
  };

  Permission.prototype.search = function (role, ressource) {
    return Permission.findOne({
      where: {
        NOMROLE: role,
        NOMRESSOURCE: ressource
      },
      row: true
    });
  };

  Permission.prototype.delete = async function (permission) {
    return permission.destroy()
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  Permission.prototype.grantLevel = async function (permission, level) {
    return permission.update({
        NOM: 1
      })
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  Permission.prototype.retrieveLevel = async function (permission, level) {
    return permission.update({
        NOM: 0
      })
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  return Permission;
};