'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Actualite = sequelize.define('actualite', {
		IDACTUALITE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		CONTENU: {
			type: DataTypes.STRING(128),
			allowNull: false
		},
		VALIDE: {
			type: DataTypes.INTEGER(1),
			defaultValue: 1
		}
	}, {
		tableName: 'actualite'
	});

	return Actualite;
};