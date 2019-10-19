'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Reponse = sequelize.define('reponse', {
		IDREPONSE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		CONTENU: {
			type: DataTypes.STRING(128),
			allowNull: false
		}
	}, {
		tableName: 'reponse'
	});

	return Reponse;
};