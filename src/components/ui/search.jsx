import { Input } from '@nextui-org/react';

const Search = ({ filterValue, onSearchChange }) => {
	return (
		<div className='relative flex items-center justify-center w-full '>
			<Input
				isClearable
				type='text'
				color='default'
				variant='bordered'
				radius='sm'
				size='lg'
				placeholder='Type to search...'
				value={filterValue}
				onValueChange={onSearchChange}
				startContent={<span className='material-symbols-outlined'>search</span>}
			/>
		</div>
	);
};

export { Search };
