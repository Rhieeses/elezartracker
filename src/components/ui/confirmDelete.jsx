// ConfirmModal.jsx
import React from 'react';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
} from '@nextui-org/react';

export default function ConfirmDelete({ isOpen, onOpenChange, confirmCallback }) {
	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			radius='sm'
			hideCloseButton
			isDismissable={false}
			isKeyboardDismissDisabled={true}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className='flex flex-col gap-1'>Are you sure?</ModalHeader>
						<ModalBody>
							<p>Do you really want to delete this? This action cannot be undone.</p>
						</ModalBody>
						<ModalFooter>
							<Button
								radius='sm'
								variant='bordered'
								onClick={onClose}>
								Cancel
							</Button>
							<Button
								variant='solid'
								radius='sm'
								className='bg-rose-700 text-white'
								onClick={() => {
									confirmCallback(); // Call the confirmation callback
									onClose(); // Close the modal
								}}>
								Confirm
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
