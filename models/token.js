'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Token = sequelize.define('token', {
    ID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    EMAIL: {
      type: DataTypes.STRING(128),
      reference: {
        model: 'utilisateur',
        key: 'EMAIL'
      },
      allowNull: false
    }
  }, {
    tableName: 'token'
  });

  Token.associate = function (models) {
    Token.belongsTo(models.utilisateur, {
      foreignKey: 'EMAIL',
      targetKey: 'EMAIL',
      as: 'utilisateur'
    });
  };

  Token.prototype.create = async function (token) {
    const tmp = Token.build(token);
    return await tmp.save()
      .then(t => {
        return t;
      })
      .catch(err => {
        throw err;
      });
  };

  Token.prototype.invalidate = function (token) {
    return token.destroy()
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  Token.prototype.searchBy = function (email) {
    return Token.findOne({
      where: {
        EMAIL: email
      },
      row: true,
      include: [{
        all: true
      }]
    });
  };

  Token.prototype.search = function (token) {
    return Token.findOne({
      where: {
        ID: token
      },
      row: true,
      include: [{
        all: true
      }]
    });
  };
  return Token;
};