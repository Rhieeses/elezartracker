const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg');

const connection = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

/** 
 * 
 * const connection = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});
 *


*/

// Use DATABASE_URL from .env for Heroku

connection.connect((error) => {
	if (error) throw error; // Correct error handling
	console.log('Connected to Heroku Postgres database');
});

module.exports = connection;
