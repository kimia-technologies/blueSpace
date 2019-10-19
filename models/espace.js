'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Espace = sequelize.define('espace', {
		NUMESPACE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		NOMTYPE: {
			type: DataTypes.STRING(128),
			allowNull: false,
			references: {
				model: 'type',
				key: 'NOMTYPE'
			}
		},
		NOM: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		CONCERNE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0
		},
		OCCP: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: 0
		},
		NOMSITE: {
			type: DataTypes.STRING(128),
			allowNull: false,
			references: {
				model: 'site',
				key: 'NOMSITE'
			}
		}
	}, {
		tableName: 'espace'
	});

	Espace.associate = function (models) {
		Espace.hasMany(models.reservation, {
			foreignKey: 'NUMESPACE'
		});
		Espace.belongsTo(models.type, {
			foreignKey: 'NOMTYPE',
			targetKey: 'NOMTYPE',
			as: 'type'
		});
		Espace.belongsTo(models.site, {
			foreignKey: 'NOMSITE',
			targetKey: 'NOMSITE',
			as: 'site'
		});
	};

	Espace.prototype.list = function () {
		return Espace.findAll({
			include: [{
				all: true
			}],
			row: true
		});
	};

	Espace.prototype.listBy = function (type) {
		return Espace.findAll({
			include: [{
				all: true
			}],
			where: {
				NOMTYPE: type
			},
			row: true
		});
	};

	Espace.prototype.create = async function (espace) {
		const tmp = Espace.build(espace);
		return await tmp.save()
			.then(t => {
				return t;
			})
			.catch(err => {
				return null;
			});
	};

	Espace.prototype.occp = async function (espace) {
		return await espace.update({
				OCCP: 1
			})
			.then(() => {
				return 200;
			})
			.catch(err => {
				throw err;
			});
	};

	Espace.prototype.delete = function (espace) {
		return espace.destroy()
			.then(() => {
				return 204;
			})
			.catch(err => {
				throw err;
			});
	};

	Espace.prototype.addUser = async function (espace, c) {
		return await espace.update({
				CONCERNE: espace.get('CONCERNE') + parseInt(c)
			})
			.then(() => {
				return 200;
			})
			.catch(err => {
				throw err;
			});
	};

	Espace.prototype.rmvUser = async function (espace, c) {
		return await espace.update({
				CONCERNE: espace.get('CONCERNE') - parseInt(c),
				OCCP: 1
			})
			.then(() => {
				return 200;
			})
			.catch(err => {
				throw err;
			});
	};

	Espace.prototype.search = function (num) {
		return Espace.findByPk(num, {
			include: [{
				all: true
			}],
			row: true
		});
	};

	return Espace;
};