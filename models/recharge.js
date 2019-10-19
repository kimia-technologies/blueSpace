'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Recharge = sequelize.define('recharge', {
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
		JOUR: {
			type: DataTypes.DATE,
			allowNull: false
		},
		SOURCE: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		ETAT: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: 1
		}
	}, {
		tableName: 'recharge'
	});

	Recharge.associate = function (models) {
		Recharge.belongsTo(models.reservation, {
			foreignKey: 'IDRESERVATION',
			targetKey: 'IDRESERVATION',
			as: 'reservation'
		});
		Recharge.belongsTo(models.service, {
			foreignKey: 'NOMSERVICE',
			targetKey: 'NOMSERVICE',
			as: 'service'
		});
	};

	return Recharge;
};