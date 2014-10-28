// Update with your config settings.

module.exports = {

  test: {
    client: 'postgresql',
    connection: 'postgres://127.0.0.1:5432/mailchimp_adapter_test',
    migrations: {
      tableName: 'migrations'
    }
  },

  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  }

};
