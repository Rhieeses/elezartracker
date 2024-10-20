const connection = require('../../config/db');
const bcrypt = require('bcrypt');

async function updateProject(formData, id) {
	const {
		warningvalue,
		clientId,
		projectName,
		projectAddress,
		projectContractPrice,
		projectStartDate,
		projectEndDate,
		projectDescription,
		imageFile,
	} = formData;

	const queryInsertProject = `
      UPDATE project 
      SET 
	  	warningvalue = $10,
        "client_id" = $1, 
        "project_name" = $2, 
        "project_address" = $3, 
        "project_contractPrice" = $4, 
        "project_startDate" = $5, 
        "project_endDate" = $6, 
        "project_description" = $7, 
        "project_projectPicture" = $8
      WHERE 
        id = $9
      RETURNING *;
    `;

	try {
		const result = await connection.query(queryInsertProject, [
			clientId,
			projectName,
			projectAddress,
			projectContractPrice,
			projectStartDate,
			projectEndDate,
			projectDescription,
			imageFile,
			id,
			warningvalue,
		]);

		return result.rows[0]; // Return the updated project row
	} catch (error) {
		console.error(`Error updating data: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function updateAccount(formData, id) {
	const { username, name, email, imageFile } = formData;

	const queryAccount = `
      UPDATE users 
      SET 
	   username = $1, 
	   name = $2,
	   email = $3,
	   profilepicture = $4
      WHERE 
        id = $5
      RETURNING *;
    `;

	try {
		const result = await connection.query(queryAccount, [username, name, email, imageFile, id]);

		return result.rows[0];
	} catch (error) {
		console.error(`Error updating data: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function editVendor(editForm, id) {
	const { vendorName, vendorContact, vendorEmail, vendorServices, vendorAddress, imageFile } =
		editForm;

	const queryUpdateVendor = `
      UPDATE vendor 
      SET 
	  	"vendor_name" = $1,
        "vendor_address" = $2, 
        "vendor_email" = $3, 
        "vendor_contactNo" = $4, 
        "vendor_services" = $5, 
        "vendor_picture" = $6
      WHERE 
        id = $7
      RETURNING *;
    `;

	try {
		const result = await connection.query(queryUpdateVendor, [
			vendorName,
			vendorAddress,
			vendorEmail,
			vendorContact,
			vendorServices,
			imageFile,
			id,
		]);

		return result.rows[0];
	} catch (error) {
		console.error(`Error updating data: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function ApproveTransfer(id) {
	const queryUpdateTransaction = `
    UPDATE accounts_transaction
	SET status = 'SUCCESSFUL'
	WHERE id = $1
    `;

	try {
		const result = await connection.query(queryUpdateTransaction, [id]);
		if (result.rowCount === 0) {
			throw new Error(`Transaction with id ${id} not found.`);
		}

		return { message: 'Transfer approved successfully' };
	} catch (error) {
		console.error(`Error updating transaction: ${error.message}`);
		throw new Error(`Error updating data: ${error.message}`);
	}
}

async function changePassword(changePasswordForm, id, res) {
	const { oldPassword, newPassword } = changePasswordForm;

	const queryCheckPassword = `
        SELECT password FROM users WHERE id = $1;
    `;

	const queryUpdatePassword = `
        UPDATE users SET password = $1 WHERE id = $2;
    `;

	try {
		const resultPassword = await connection.query(queryCheckPassword, [id]);
		const user = resultPassword.rows[0];

		if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
			return res.status(400).json({ message: 'Old password is incorrect' });
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 10);
		await connection.query(queryUpdatePassword, [hashedNewPassword, id]);

		return res.json({ message: 'Password changed successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Server error' });
	}
}

module.exports = {
	updateProject,
	updateAccount,
	editVendor,
	ApproveTransfer,
	changePassword,
};
