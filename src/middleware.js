import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(req) {
	let token = req.cookies.get('token');
	const { pathname } = req.nextUrl;

	// Allow public routes like login or homepage
	if (pathname === '/login' || pathname === '/') {
		return NextResponse.next();
	}

	// If there is no token, redirect to the login page
	if (!token) {
		const loginUrl = `${req.nextUrl.origin}/login`;
		return NextResponse.redirect(loginUrl);
	}

	try {
		let tokenString = token.value; // Use the actual token string here
		const { payload } = await jwtVerify(tokenString, new TextEncoder().encode(JWT_SECRET));

		const decoded = payload; // Assuming payloadObject is already an object

		//console.log('Decoded Token:', decoded.position); // Log the decoded token for debugging

		// Define allowed routes based on user position
		const userRoutes = [
			'/dashboard',
			'/projects/:path*',
			'/clients/:path*',
			'/vendors/:path*',
			'/accounts/:path*',
			'/receivables/:path*',
			'/sales/:path*',
			'/expense/:path*',
			'/api/:path*',
		];
		const adminRoutes = ['/admin'];

		// Check if the request is for an admin route
		if (adminRoutes.some((route) => pathname.startsWith(route))) {
			if (decoded.position !== 'Admin') {
				const unauthorizedUrl = `${req.nextUrl.origin}/unauthorized`;
				return NextResponse.redirect(unauthorizedUrl);
			}
		}

		// Check if the request is for a user route
		if (userRoutes.some((route) => pathname.startsWith(route))) {
			if (decoded.position !== 'Bookkeeper' && decoded.position !== 'Admin') {
				const unauthorizedUrl = `${req.nextUrl.origin}/unauthorized`;
				return NextResponse.redirect(unauthorizedUrl);
			}
		}

		if (
			decoded.position === 'Admin' &&
			!adminRoutes.some((route) => pathname.startsWith(route))
		) {
			const adminUrl = `${req.nextUrl.origin}/admin`;
			return NextResponse.redirect(adminUrl);
		}

		// If none of the routes match, allow access by default
		return NextResponse.next();
	} catch (err) {
		console.error('JWT verification error:', err);

		// If token verification fails, redirect to login
		const loginUrl = `${req.nextUrl.origin}/`;
		return NextResponse.redirect(loginUrl);
	}
}

export const config = {
	matcher: [
		'/dashboard',
		'/projects/:path*',
		'/clients/:path*',
		'/vendors/:path*',
		'/accounts/:path*',
		'/receivables/:path*',
		'/sales/:path*',
		'/expense/:path*',
		'/transactions',
		'/reports',
		'/api/(.*)', // To match any API route
		'/admin/:path*', // Admin routes matcher
	],
};
