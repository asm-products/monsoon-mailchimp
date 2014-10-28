exports.db = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://127.0.0.1:5432/mailchimp_adapter_test'
};

exports.migrations = {
  tableName: 'migrations'
};
