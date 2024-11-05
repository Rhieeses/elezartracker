'use client';
import Header from '@/components/ui/header';
import { useState } from 'react';
import axios from 'axios';
//const fetcher = (url) => axios.get(url, { withCredentials: true }).then((res) => res.data);

export default function Test() {
	const [prompt, setPrompt] = useState('');
	const [response, setResponse] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setResponse('');

		try {
			const res = await fetch('/api/openai', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt }),
			});

			if (!res.ok) {
				throw new Error('Error fetching data');
			}

			const data = await res.json();
			setResponse(data.choices[0].message.content);
		} catch (error) {
			console.error('Error:', error);
			setResponse('Error fetching data from OpenAI.');
		} finally {
			setLoading(false);
		}
	};
	return (
		<Header>
			<div className='p-10 border-b-[1px] flex justify-between items-center'>
				<div className='flex items-center space-x-4'>
					<span className='material-symbols-outlined cursor-pointer'>arrow_back_ios_new</span>
					<img
						src='/report.png'
						alt=''
						className='w-8 object-contain'
					/>

					<h1 className='font-bold tracking-wide text-3xl text-left'>Receipt Scanner</h1>
				</div>
			</div>

			<div>
				<h1>OpenAI Next.js Example</h1>
				<form onSubmit={handleSubmit}>
					<textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder='Enter your prompt here'
						rows={5}
						required
					/>
					<button
						type='submit'
						disabled={loading}>
						{loading ? 'Loading...' : 'Submit'}
					</button>
				</form>
				{response && (
					<div>
						<h2>Response from OpenAI:</h2>
						<p>{response}</p>
					</div>
				)}
			</div>
		</Header>
	);
}
