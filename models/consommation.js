'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Consommation = sequelize.define('consommation', {
    NOMSERVICE: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'service',
        key: 'NOMSERVICE'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    },
    IDRESERVATION: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'reservation',
        key: 'IDRESERVATION'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    },
    QUANTITE: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    JOUR: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    CONSOME: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    ETAT: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'consommation'
  });

  Consommation.associate = function (models) {
    Consommation.belongsTo(models.reservation, {
      foreignKey: 'IDRESERVATION',
      targetKey: 'IDRESERVATION',
      as: 'reservation'
    });
    Consommation.belongsTo(models.service, {
      foreignKey: 'NOMSERVICE',
      targetKey: 'NOMSERVICE',
      as: 'service'
    });
  };

  Consommation.prototype.create = async function (consommations) {
    return await Consommation.bulkCreate(consommations, {returning: true})
      .then(cons => {
        return cons;
      })
      .catch(err => {
        throw err;
      });
  };

  Consommation.prototype.renouveler = async function (consommations) {
    return await Consommation.bulkCreate(consommations, {updateOnDuplicate: ['QUANTITE', 'ETAT']})
      .then(cons => {
        return 200;
      })
      .catch(err => {
        throw err;
      });
  };

  Consommation.prototype.list = async function(rsv) {
    return Consommation.findAll({
      include: [{all: true}],
      where: {
        IDRESERVATION: rsv,
        ETAT: {
	  $or: [{
	        $eq: 1
	      },
	      {
	        $eq: 0
	      }
	  ]
	}

      },
      row: true
    });
  };

  Consommation.prototype.confirm = async function(consommation) {
    consommation.update({
      ETAT: 1
    });
  }

  Consommation.prototype.invalide = async function (consommation) {
    return await consommation.update({
        ETAT: -1
      })
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  Consommation.prototype.search = async function (resv, service) {
    return await Consommation.findOne({
        include: [{
          all: true
        }],
        where: {
          NOMSERVICE: service,
          IDRESERVATION: resv
        },
        row: true
      })
      .then((r) => {
        return r;
      })
      .catch(err => {
        throw err;
      });
  };

  return Consommation;
};