'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Notification = sequelize.define('notification', {
		EMAIL: {
			type: DataTypes.STRING(128),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'utilisateur',
				key: 'EMAIL'
			}
		},
		IDACTUALITE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'actualite',
				key: 'IDACTUALITE'
			}
		},
		TYPE: {
			type: DataTypes.STRING(128),
			allowNull: false
		},
		DATE: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 'notification'
	});

	return Notification;
};