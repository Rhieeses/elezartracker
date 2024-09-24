const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
});

const testConnection = async () => {
	try {
		const client = await pool.connect();
		const res = await client.query('SELECT NOW()');
		console.log('Database Time:', res.rows[0]);
		client.release();
	} catch (error) {
		console.error('Database connection error:', error);
	}
};

testConnection();
