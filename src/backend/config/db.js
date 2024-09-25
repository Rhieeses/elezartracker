/**const dotenv = require('dotenv');
dotenv.config();
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
});

pool.connect((error) => {
	if (error) throw error; // Correct error handling
	console.log('connected to database');
});

module.exports = pool;**/

const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg');

// Use DATABASE_URL from .env for Heroku
const connection = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false, // Heroku requires SSL connection
	},
});

connection.connect((error) => {
	if (error) throw error; // Correct error handling
	console.log('Connected to Heroku Postgres database');
});

module.exports = connection;

