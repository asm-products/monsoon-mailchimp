module.exports = function(sequelize, dataTypes) {
  var Subscriber = sequelize.define('Subscriber', {
    id: {
      type: dataTypes.UUID,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    deleted_at: dataTypes.STRING,
    endpoint: dataTypes.STRING,
    product: dataTypes.STRING
  }, {
    underscored: true,
    tableName: 'subscribers',
    deletedAt: 'deleted_at',
    paranoid: true
  });

  return Subscriber;
};
