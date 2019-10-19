'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Role = sequelize.define('role', {
		NOMROLE: {
			type: DataTypes.STRING(128),
			allowNull: false,
			primaryKey: true
		}
	}, {
		timestamps: false,
		tableName: 'role'
	});

	Role.associate = function (models) {
		Role.belongsToMany(models.ressource, {
			through: {
				model: 'permission',
				unique: false
			},
			foreignKey: 'NOMROLE'
		});
		Role.belongsToMany(models.utilisateur, {
			through: {
				model: 'possede',
				unique: false
			},
			foreignKey: 'NOMROLE'
		});
	};

	Role.prototype.list = function () {
		return Role.findAll();
	};

	Role.prototype.create = async function (role) {
		const tmp = Role.build(role);
		return await tmp.save()
			.then(r => {
				return;
			})
			.catch(err => {
				throw err;
			});
	};

	Role.prototype.delete = async function (role) {
		return role.destroy()
			.then(() => {
				return 204;
			})
			.catch(err => {
				throw err;
			});
	};

	Role.prototype.update = async function (role, nom) {
		return role.update({
				NOM: nom
			})
			.then(() => {
				return 204;
			})
			.catch(err => {
				throw err;
			});
	};

	return Role;
};