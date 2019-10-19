'[use strict';

/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const Image = sequelize.define('image', {
    IDIMAGE: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    CONTENU: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
		NOMTYPE: {
			type: DataTypes.STRING(128),
			allowNull: false,
			references: {
				model: 'type',
				key: 'NOMTYPE'
			}
		}
  }, {
    timestamps: false,
    tableName: 'image'
  });

  Image.associate = function (models) {
    Image.belongsTo(models.type, {
      foreignKey: 'NOMTYPE',
      targetKey: 'NOMTYPE',
      as: 'type'
    });
  };

  Image.prototype.list = function (t) {
    return Image.findAll({
      where: {
        NOMTYPE: t
      },
      attributes: ['CONTENU'],
      row: true
    });
  };

  Image.prototype.create = async function (image) {
    const tmp = Image.build(image);
    return await tmp.save()
      .then(i => {
        return i;
      })
      .catch(err => {
        return null;
      });
  };

  Image.prototype.update = function (image, c) {
    return image.update({
        CONTENU: c
      })
      .then(i => {
        return i;
      })
      .catch(err => {
        return null;
      });
  };

  Image.prototype.delete = async function (image) {
    return await image.destroy()
      .then(() => {
        return 204;
      })
      .catch(err => {
        throw err;
      });
  };

  Image.prototype.search = function (id) {
    return Image.findByPk(id, {
      row: true
    });
  };

  return Image;
};