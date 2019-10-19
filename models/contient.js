/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Contient = sequelize.define('contient', {
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
    NOMSERVICE: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'service',
        key: 'NOMSERVICE'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    },
    QUANTITE: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: false,
    tableName: 'contient'
  });

  Contient.associate = function (models) {
    Contient.belongsTo(models.formule, {
      foreignKey: 'IDFORMULE',
      targetKey: 'IDFORMULE',
      as: 'formule'
    });
    Contient.belongsTo(models.service, {
      foreignKey: 'NOMSERVICE',
      targetKey: 'NOMSERVICE',
      as: 'service'
    });
  };

  Contient.prototype.create = async function (contient) {
    const tmp = Contient.build(contient);
    return await tmp.save();
  };

  Contient.prototype.list = async function (formule) {
    return await Contient.findAll({
      include: [{
        all: true
      }],
      where: {
        IDFORMULE: formule
      },
      row: true
    });
  };

  Contient.prototype.search = async function (formule, service) {
    return await Contient.findOne({
      include: [{
        all: true
      }],
      where: {
        IDFORMULE: formule,
        NOMSERVICE: service
      },
      row: true
    });
  };

  Contient.prototype.delete = async function (contient) {
    return await contient.destroy()
      .then(() => {
        return 204;
      })
      .catch(err => {
        return err;
      });
  };

  return Contient;
};