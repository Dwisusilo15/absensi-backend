const { Sequelize } = require('sequelize');
const pg = require('pg');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false } // Supabase butuh SSL
  }
});

module.exports = { sequelize };
