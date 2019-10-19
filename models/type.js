'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Type = sequelize.define('type', {
		NOMTYPE: {
			type: DataTypes.STRING(128),
			allowNull: false,
			primaryKey: true
		},
		CONTENANCE: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		INVITE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 1
		},
		DESCRIPTION: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null
		}
	}, {
		tableName: 'type'
	});

	Type.associate = function (models) {
		Type.belongsToMany(models.formule, {
			through: {
				model: 'offre',
				unique: false
			},
			foreignKey: 'NOMTYPE'
		});
		Type.hasMany(models.espace, {
			foreignKey: 'NOMTYPE'
		});
		Type.hasMany(models.image, {
			foreignKey: 'NOMTYPE'
		});
	};

	Type.prototype.list = function () {
		return Type.findAll({
			row: true
		});
	};

	Type.prototype.create = async function (type) {
		const tmp = Type.build(type);
		if(tmp.NOMTYPE !== 'Open space')
			tmp.set('INVITE', type.c, {row: true});
		return await tmp.save()
			.then(t => {
				return t;
			})
			.catch(err => {
				return null;
			});
	};

	Type.prototype.update = function (type, params) {
		return type.update({
				CONTENANCE: params.c,
				PRIX: params.p
			})
			.then(t => {
				return t;
			})
			.catch(err => {
				return null;
			});
	};

	Type.prototype.delete = async function (type) {
		return await type.destroy()
			.then(() => {
				return 204;
			})
			.catch(err => {
				throw err;
			});
	};

	Type.prototype.search = function (nom) {
		return Type.findByPk(nom, {
			row: true
		});
	};

	return Type;
};