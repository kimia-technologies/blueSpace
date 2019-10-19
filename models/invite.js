'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Invite = sequelize.define('invite', {
    ANIMATEUR: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'utilisateur',
        key: 'EMAIL'
      }
    },
    PERSON: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'utilisateur',
        key: 'EMAIL'
      }
    },
    LIEN: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'invite'
  });

  Invite.associate = function (models) {
    Invite.belongsTo(models.utilisateur, {
      foreignKey: 'ANIMATEUR',
      targetKey: 'EMAIL',
      as: 'Animateur',
      onDelete: 'CASCADE'
    });
    Invite.belongsTo(models.utilisateur, {
      foreignKey: 'PERSON',
      targetKey: 'EMAIL',
      as: 'Person',
      onDelete: 'CASCADE'
    });
  };

  Invite.prototype.listBy = function (animateur) {
    return Invite.findAll({
      where: {
        ANIMATEUR: animateur
      },
      attributes: ['NOMROLE'],
      row: true
    });
  };

  Invite.prototype.create = async function (invite) {
    const tmp = Invite.build(invite);
    return await tmp.save()
      .then(r => {
        return;
      })
      .catch(err => {
        throw err;
      });
  };

  Invite.prototype.search = function (animateur, person) {
    return Invite.findOne({
      where: {
        ANIMATEUR: animateur,
        PERSON: person
      },
      row: true
    });
  };

  return Invite;
};