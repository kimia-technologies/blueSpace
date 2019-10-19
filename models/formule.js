/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Formule = sequelize.define('formule', {
    IDFORMULE: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    PERIODE: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    },
    UNITE: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: 'H'
    },
    NOM: {
      type: DataTypes.STRING(128),
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'formule'
  });

  Formule.associate = function (models) {
    Formule.belongsToMany(models.type, {
      through: {
        model: 'offre',
        unique: false
      },
      foreignKey: 'IDFORMULE'
    });
    Formule.belongsToMany(models.service, {
      through: {
        model: 'contient',
        unique: false
      },
      foreignKey: 'IDFORMULE'
    });
    Formule.hasMany(models.reservation, {
      foreignKey: 'IDFORMULE'
    });
  };

  Formule.prototype.list = function () {
    return Formule.findAll({
      row: true
    });
  };

  Formule.prototype.create = async function (formule) {
    const tmp = Formule.build(formule);
    return await tmp.save()
      .then(f => {
        return f;
      })
      .catch(err => {
        throw err;
      });
  };

  Formule.prototype.search = async function (id) {
    return await Formule.findByPk(id, {
        row: true
      })
      .then(Formule => {
        return Formule;
      })
      .catch(err => {
        throw err;
      });
  };

  Formule.prototype.delete = async function (formule) {
    return await formule.destroy()
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  Formule.prototype.listDomiciliation = async function () {
    return await Formule.findAll({
      where: {
        $ne: [{
          NOM: null
        }]
      },
      row: true
    });
  };

  return Formule;
};