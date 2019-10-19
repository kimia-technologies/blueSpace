'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Service = sequelize.define('service', {
		NOMSERVICE: {
			type: DataTypes.STRING(128),
			allowNull: false,
			primaryKey: true
		},
		DESCRIPTION: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		UNITE: {
			type: DataTypes.STRING(15),
			allowNull: true,
			defaultValue: ''
		}
	}, {
		timestamps: false,
		tableName: 'service'
	});

	Service.associate = function (models) {
		Service.belongsToMany(models.formule, {
			through: {
				model: 'contient',
				unique: false
			},
			foreignKey: 'NOMSERVICE'
		});
		Service.belongsToMany(models.utilisateur, {
			through: {
				model: 'recharge',
				unique: false
			},
			foreignKey: 'NOMSERVICE'
		});
		Service.belongsToMany(models.reservation, {
			through: {
				model: 'consommation',
				unique: false
			},
			foreignKey: 'NOMSERVICE'
		});
	};

	Service.prototype.list = function () {
		return Service.findAll({
			row: true
		});
	};

	Service.prototype.create = async function (service) {
		const tmp = Service.build(service);
		return await tmp.save()
			.then(t => {
				return t;
			})
			.catch(err => {
				return null;
			});
	};

	Service.prototype.update = function (service, params) {
		return service.update({
				DESCRIPTION: params.d
			})
			.then(t => {
				return t;
			})
			.catch(err => {
				return null;
			});
	};

	Service.prototype.delete = async function (service) {
		return await service.destroy()
			.then(() => {
				return 204;
			})
			.catch(err => {
				return err;
			});
	};

	Service.prototype.search = function (nom) {
		return Service.findByPk(nom, {
			row: true
		});
	};

	return Service;
};