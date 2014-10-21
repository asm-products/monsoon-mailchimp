exports.db = {
  client: 'pg',
  connection: process.env.DATABASE_URL
};

exports.migrations = {
  tableName: 'migrations'
};
