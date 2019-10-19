'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Utilisateur = sequelize.define('utilisateur', {
		EMAIL: {
			type: DataTypes.STRING(128),
			allowNull: false,
			primaryKey: true
		},
		NOM: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		PRENOM: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		SEXE: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: 'HOMME'
		},
		PASSWORD: {
			type: DataTypes.STRING(128),
			allowNull: false
		},
		PHONE: {
			type: DataTypes.STRING(128),
			allowNull: false,
			unique: true
		},
		PSEUDO: {
			type: DataTypes.STRING(128),
			allowNull: false,
			unique: true
		},
		ETAT: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: 0
		},
		CODE: {
			type: DataTypes.STRING(4),
			allowNull: true,
			defaultValue: null
		},
		PHOTO: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: null
		},
		ENTREPRISE: {
			type: DataTypes.STRING(32),
			allowNull: true,
			defaultValue: null
		},
		ENTREROLE: {
			type: DataTypes.STRING(32),
			allowNull: true,
			defaultValue: null
		},
		ANNIV: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			defaultValue: null
		}
	}, {
		tableName: 'utilisateur'
	});

	Utilisateur.associate = function (models) {
		Utilisateur.hasMany(models.reservation, {
			foreignKey: 'EMAIL'
		});
		Utilisateur.belongsToMany(models.role, {
			through: {
				model: 'possede',
				unique: false
			},
			foreignKey: 'EMAIL'
		});
		Utilisateur.belongsToMany(models.utilisateur, {
			through: {
				model: 'invite',
				unique: false
			},
			as: 'animateurs',
			foreignKey: 'ANIMATEUR'
		});
		Utilisateur.belongsToMany(models.utilisateur, {
			through: {
				model: 'invite',
				unique: false
			},
			as: 'persons',
			foreignKey: 'PERSON'
		});
		Utilisateur.hasMany(models.token, {
			foreignKey: 'EMAIL'
		});
	};

	Utilisateur.prototype.list = function () {
		return Utilisateur.findAll({
			include: [{
				all: true
			}],
			row: true
		});
	};

	Utilisateur.prototype.create = async function (utilisateur) {
		const tmp = Utilisateur.build(utilisateur);
		return await tmp.save()
			.then(t => {
				return t;
			})
			.catch(err => {
				throw err;
			});
	};

	Utilisateur.prototype.edit = async function (utilisateur, params) {
		return await Utilisateur.bulkCreate(Array(utilisateur), {updateOnDuplicate: ['PSEUDO', 'PHONE', 'NOM', 'PRENOM', 'PHOTO', 'ENTREPRISE', 'ENTREROLE', 'ANNIV']})
			.then(t => {
				return 200;
			})
			.catch(err => {
				throw err;
			});
	};

	Utilisateur.prototype.delete = function (utilisateur) {
		return utilisateur.update({
				ETAT: 0
			})
			.then(() => {
				return 204;
			})
			.catch(err => {
				throw err;
			});
	};

	Utilisateur.prototype.login = async function (params) {
		return await Utilisateur.findOne({
				where: {
					$or: [{
						EMAIL: params.id,
					}, {
						PHONE: params.id
					}, {
						PSEUDO: params.id
					}],
					PASSWORD: params.k,
					ETAT: 1
				},
				attributes: ['EMAIL', 'PSEUDO'],
				row: true
			})
			.then(t => {
				return t;
			})
			.catch(err => {
				throw err;
			});
	};

	Utilisateur.prototype.isExists = async function (k) {
		return Utilisateur.findAll({
				where: {
					$or: [{
						EMAIL: k,
					}, {
						PHONE: k
					}, {
						PSEUDO: k
					}]
				}
			})
			.then((users) => {
				if (users.length !== 0)
					return true;
				return false;
			})
			.catch(err => {
				throw err;
			});
	};

	Utilisateur.prototype.activate = async function (e, c) {
		
		return await Utilisateur.findByPk(e)
			.then(async user => {
				if (user !== null) {
					if (user.get('CODE') === c) {
						return await user.update({
							ETAT: 1,
							CODE: 'NULL'
						}).then(u => 'activation reussite').catch(err => {throw err;});
					} else return 'code incorrect';
				} else return 'compte inexistant';
			})
			.catch(err => {
				throw err;
			});
	};

	Utilisateur.prototype.search = function (id) {
		return Utilisateur.findOne({
			where: {
				$or: [{
					EMAIL: id,
				}, {
					PHONE: id
				}, {
					PSEUDO: id
				}]
			},
			attributes: ['EMAIL', 'PSEUDO', 'NOM', 'PRENOM', 'PHONE', 'PASSWORD', 'PHOTO', 'ENTREPRISE', 'ENTREROLE', 'ANNIV'],
			row: true
		});
	};

	return Utilisateur;
};