// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
	const token = req.cookies.get('token');

	const { pathname } = req.nextUrl;

	if (pathname === '/login' || pathname === '/') {
		return NextResponse.next();
	}

	if (!token) {
		const loginUrl = `${req.nextUrl.origin}/`; // Create an absolute URL for the login page
		return NextResponse.redirect(loginUrl); // Redirect to the login page
	}

	return NextResponse.next();
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
		'/clients/:path*',
	],
};
