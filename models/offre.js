/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const Offre = sequelize.define('offre', {
		IDFORMULE: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'formule',
				key: 'IDFORMULE'
			},
			onDelete: 'cascade',
			onUpdate: 'cascade'
		},
		NOMTYPE: {
			type: DataTypes.STRING(128),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'type',
				key: 'NOMTYPE'
			},
			onDelete: 'cascade',
			onUpdate: 'cascade'
		},
		PRIX: {
			type: DataTypes.DOUBLE,
			allowNull: false
		}
	}, {
		timestamps: false,
		tableName: 'offre'
	});

	Offre.associate = function (models) {
		Offre.belongsTo(models.formule, {
			foreignKey: 'IDFORMULE',
			targetKey: 'IDFORMULE',
			as: 'formule'
		});
		Offre.belongsTo(models.type, {
			foreignKey: 'NOMTYPE',
			targetKey: 'NOMTYPE',
			as: 'type'
		});
	};

	Offre.prototype.create = async function (offre) {
		const tmp = Offre.build(offre);
		return await tmp.save();
	};

	Offre.prototype.search = async function (type, formule) {
		return await Offre.findOne({
			where: {
				IDFORMULE: formule,
				NOMTYPE: type
			},
			row: true
		});
	};

	Offre.prototype.list = async function (type) {
		return Offre.findAll({
			include: [{
				all: true
			}],
			where: {
				NOMTYPE: type
			},
			row: true
		});
	};

	Offre.prototype.delete = async function (offre) {
		return await offre.destroy()
			.then(() => {
				return 204;
			})
			.catch(err => {
				throw err;
			});
	};

	return Offre;
};