module.exports = function(sequelize, dataTypes) {
  var Activity = sequelize.define('Activity', {
    id: {
      type: dataTypes.UUID,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    product: dataTypes.STRING,
    webhook_id: dataTypes.STRING,
    type: dataTypes.STRING,
    list_id: dataTypes.STRING,
    email: dataTypes.STRING
  }, {
    underscored: true,
    tableName: 'activities'
  });

  return Activity;
};
