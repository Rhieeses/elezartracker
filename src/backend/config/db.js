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

const { Pool } = require('pg');
require('dotenv').config();

const connection = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

connection.connect((err, client, release) => {
	if (err) {
		console.error('Error connecting to the database:', err.stack);
	} else {
		console.log('Connected to the database');
		release();
	}
});

module.exports = connection;
