module.exports = function(sequelize, dataTypes) {
  var Update = sequelize.define('Update', {
    id: {
      type: dataTypes.UUID,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    sent_at: dataTypes.DATE,
    checked_at: dataTypes.DATE,
    current_count: dataTypes.INTEGER,
    product: {
      type: dataTypes.STRING,
      unique: true
    }
  }, {
    underscored: true,
    tableName: 'updates'
  });

  return Update;
};
