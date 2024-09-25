import {
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalContent,
	ModalFooter,
} from '@nextui-org/react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ConfirmModal({ isOpen, onOpenChange, projectId, clientId }) {
	const router = useRouter();
	const [isUrl, setIsUrl] = useState(null);
	const [isPush, setIsPush] = useState(null);

	useEffect(() => {
		if (projectId) {
			setIsUrl(`/api/project-delete/${projectId}`);
			setIsPush('/projects');
		} else if (clientId) {
			setIsUrl(`/api/client-delete/${clientId}`);
			setIsPush('/clients');
		}
	}, [projectId, clientId]);

	const handleDelete = async () => {
		if (!isUrl) {
			console.error('No valid URL found for deletion');
			return;
		}
		try {
			await axios.delete(isUrl);
			onOpenChange();
			if (isPush) {
				router.push(isPush);
			}
		} catch (error) {
			console.error('Error deleting project:', error);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			radius='sm'
			hideCloseButton
			onOpenChange={onOpenChange}
			isDismissable={false}
			isKeyboardDismissDisabled={true}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className='flex flex-col gap-1'>Are you sure?</ModalHeader>
						<ModalBody>
							<span
								className='material-symbols-outlined text-red-500 text-center'
								style={{ fontSize: '64px' }}>
								warning
							</span>
							<p>Do you really want to delete this? This action cannot be undone.</p>
						</ModalBody>
						<ModalFooter>
							<Button
								color='danger'
								variant='solid'
								onPress={onClose}>
								Cancel
							</Button>
							<Button
								variant='flat'
								color='primary'
								onPress={handleDelete}>
								Confirm
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}