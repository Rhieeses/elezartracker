const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verifies the JWT token and checks if the user's role is authorized.
 * @param {string} token - The JWT token to be verified.
 * @param {Array} allowedRoles - Array of roles allowed to access the resource.
 * @returns {Object} - The decoded payload if the token is valid.
 * @throws {Error} - Throws an error if the token is invalid or role is unauthorized.
 */
async function verifyToken(token, allowedRoles = []) {
	if (!token) {
		throw new Error('Unauthorized: No token provided');
	}

	try {
		// Verify the token and log the payload for debugging
		const payload = jwt.verify(token, JWT_SECRET);

		// Check if user's role matches one of the allowed roles
		if (allowedRoles.length > 0 && !allowedRoles.includes(payload.position)) {
			throw new Error('Forbidden: Insufficient permissions');
		}

		// Return the decoded payload if verification succeeds
		return payload;
	} catch (err) {
		// Log any error that occurs during verification
		console.error('Error verifying token:', err.message);

		// Token verification failed
		throw new Error('Invalid or expired token');
	}
}

// Export the verifyToken function
module.exports = {
	verifyToken,
};
