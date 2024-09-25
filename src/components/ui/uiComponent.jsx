import React from 'react';

const ContentBox = ({ iconText, labelText, strongText, descriptionText }) => {
	return (
		<div className='group hover:bg-black hover:text-white hover:scale-105 duration-300 border-1 bg-white rounded-md shadow-[0_5px_5px_-6px_rgba(0,0,0,0.3)] p-5 h-fit'>
			<div className='flex items-start flex-col'>
				<div className='flex items-center'>
					<span className='rounded-md material-symbols-outlined block'>{iconText}</span>
					<p className='ml-2'>{labelText}</p>
				</div>

				<div className='ml-12 m-5'>
					<div className='text-3xl'>{strongText}</div>
					<p className='text-slate mt-4'>{descriptionText}</p>
				</div>
			</div>
		</div>
	);
};

const ContentBoxProject = ({ iconText, labelText, strongText, descriptionText }) => {
	return (
		<div className='group z-20 group group hover:bg-black hover:text-white hover:scale-105 duration-300 border-1 bg-white rounded-md shadow-[0_5px_5px_-6px_rgba(0,0,0,0.3)] p-5 h-fit h-fit'>
			<div className='flex items-center flex-col'>
				<span
					className='material-symbols-outlined text-blue-700'
					style={{ fontSize: '48px' }}>
					{iconText}
				</span>

				<p className='ml-2 text-xl'>{labelText}</p>

				<div className='ml-12 m-5 text-center'>
					<div className='text-3xl'>{strongText}</div>
					<div className='text-slate mt-4'>{descriptionText}</div>
				</div>
			</div>
		</div>
	);
};

const IconText = ({ iconText, labelText, contentText }) => {
	return (
		<div className='flex items-center'>
			<span className='text-slate material-symbols-outlined'>{iconText}</span>
			<p className='text-sm ml-2'>{labelText}:</p>
			<p className='ml-2'>{contentText}</p>
		</div>
	);
};

const IconTextBox = ({ iconText, labelText, contentText, inputDiv }) => {
	return (
		<div className='flex'>
			<div className='bg-slate-200 p-1 rounded-md h-[36px]'>
				<span className='material-symbols-outlined ml-1 text-slate-500'>{iconText}</span>
			</div>
			<div className='ml-3'>
				<p className='flex text-xs text-slate-500 items-start'>{labelText}</p>
				<div>{inputDiv}</div>
				<p className='flex items-end'>{contentText}</p>
			</div>
		</div>
	);
};

const formatStatus = (status) => {
	if (status === 'ON PROGRESS') {
		return (
			<strong className='text-xs ml-2 rounded-xl text-green-800 bg-green-200 p-2'>
				{status}
			</strong>
		);
	} else if (status === 'PENDING') {
		return (
			<strong className='text-xs ml-2 rounded-xl text-orange-800 bg-orange-200 p-2'>
				{status}
			</strong>
		);
	} else if (status === 'FINISHED') {
		return <strong className='text-xs ml-2 rounded-xl text-white bg-black p-2'>{status}</strong>;
	} else {
		return (
			<strong className='text-xs ml-2 rounded-xl text-gray-800 bg-gray-200 p-2'>
				Unknown Status
			</strong>
		);
	}
};

export { ContentBox, IconText, IconTextBox, formatStatus, ContentBoxProject };
