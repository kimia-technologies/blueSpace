'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Question = sequelize.define('question', {
		IDQUESTION: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		IDREPONSE: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			references: {
				model: 'reponse',
				key: 'IDREPONSE'
			}
		},
		EMAIL: {
			type: DataTypes.STRING(128),
			allowNull: false,
			references: {
				model: 'utilisateur',
				key: 'EMAIL'
			}
		},
		CONTENU: {
			type: DataTypes.STRING(128),
			allowNull: false
		}
	}, {
		tableName: 'question'
	});

	return Question;
};