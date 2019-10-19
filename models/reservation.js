'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Reservation = sequelize.define('reservation', {
		IDRESERVATION: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4
		},
		NUMESPACE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			references: {
				model: 'espace',
				key: 'NUMESPACE'
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
		IDFORMULE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			references: {
				model: 'formule',
				key: 'IDFORMULE'
			}
		},
		ETAT: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: 0
		},
		NBINVITE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 1
		},
		JOUR: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		MOIS: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		ANNEE: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		TRANCHE: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		EXPIRE: {
			type: DataTypes.DATE,
			allowNull: false
		}
	}, {
		tableName: 'reservation'
	});

	Reservation.associate = function (models) {
		Reservation.belongsTo(models.utilisateur, {
			foreignKey: 'EMAIL',
			targetKey: 'EMAIL',
			as: 'utilisateur'
		});
		Reservation.belongsTo(models.espace, {
			foreignKey: 'NUMESPACE',
			targetKey: 'NUMESPACE',
			as: 'espace'
		});
		Reservation.belongsTo(models.formule, {
			foreignKey: 'IDFORMULE',
			targetKey: 'IDFORMULE',
			as: 'formule'
		});
		Reservation.belongsToMany(models.service, {
			through: {
				model: 'consommation',
				unique: false
			},
			foreignKey: 'IDRESERVATION'
		});
	};

	Reservation.prototype.list = function () {
		return Reservation.findAll({
			row: true
		});
	};

	Reservation.prototype.listValide = function () {
		return Reservation.findAll({
			include: [{
				all: true
			}],
			where: {
				ETAT: {
					$or: [{
							$eq: 1
						},
						{
							$eq: 0
						}
					]
				}
			},
			row: true
		});
	};

	Reservation.prototype.listAttente = function () {
		return Reservation.findAll({
			include: [{
				all: true
			}],
			where: {
				ETAT: 0
			},
			row: true
		});
	};

	Reservation.prototype.listOf = function (email) {
		return Reservation.findAll({
			include: [{
				all: true
			}],
			where: {
				EMAIL: email
			},
			order: [['createdAt']],
			row: true
		});
	};

	Reservation.prototype.create = async function (reservation) {
		const tmp = Reservation.build(reservation);
		return await tmp.save()
			.then(r => {
				return r;
			})
			.catch(err => {
				throw err;
			});
	};

	Reservation.prototype.invalide = async function (reservation, u = false) {
		if (u) {
			return await reservation.destroy()
				.then(() => {
					return 200;
				})
				.catch(err => {
					throw err;
				});
		}
		return await reservation.update({
				ETAT: -1
			})
			.then(() => {
				return 204;
			})
			.catch(err => {
				throw err;
			});
	};

	Reservation.prototype.valide = async function (reservation) {
		return await reservation.update({
				ETAT: 1
			})
			.then(() => {
				return 204;
			})
			.catch(err => {
				throw err;
			});
	};

	Reservation.prototype.search = async function (id) {
		return await Reservation.findByPk(id, {
				include: [{
					all: true
				}],
				row: true
			})
			.then((r) => {
				return r;
			})
			.catch(err => {
				throw err;
			});
	};

	return Reservation;
};