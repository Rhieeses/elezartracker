const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				white: '#FFFFFF',
				black: '#000000',
			},
			fontFamily: {
				inter: [
					'Inter var',
					'ui-sans-serif',
					'system-ui',
					'sans-serif',
					'Apple Color Emoji',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji',
				],
			},

			keyframes: {
				fadeInTopToBottom: {
					'0%': { opacity: '0', transform: 'translateY(-10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				zoomImage: {
					'0%': {
						'background-size': '100%',
					},
					'50%': {
						'background-size': '110%',
					},
				},
				typewriter: {
					to: {
						left: '100%',
					},
				},
			},
			animation: {
				fadeInTopToBottom: 'fadeInTopToBottom 0.4s ease-in-out',
				zoomImage: 'zoomImage 15s ease-in-out infinite',
				typewriter: 'typewriter 2s steps(11) forwards',
			},
		},
	},
	darkMode: 'class',
	plugins: [nextui({ addCommonColors: true })],
};
