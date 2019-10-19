'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Attacher = sequelize.define('attacher', {
		IDATTACH: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		IDACTUALITE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			references: {
				model: 'actualite',
				key: 'IDACTUALITE'
			}
		},
		LIEN: {
			type: DataTypes.STRING(128),
			allowNull: true
		}
	}, {
		tableName: 'attacher'
	});

	return Attacher;
};