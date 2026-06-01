import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/backend/app";
import { sequelize } from "../../src/backend/config/sequelize";
import { user as User } from "../../models/user";

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

describe("Backend Routers Testing", () => {
	let adminToken = "";
	let adminUserId = "";
	let staffToken = "";
	let staffUserId = "";
	let staffEmail = "";
	let departmentId = "";
	let managementTreeDepartmentId = "";
	let webAttendanceId = "";
	let mobileAttendanceId = "";
	let staffUsername = "";
	let staffPassword = "changeme123";
	let updatedStaffPassword = "unit-test-123";
	let staffQrCode = "";

	const uniqueSuffix = `${Date.now()}`;

	beforeAll(async () => {
		await User.update(
			{
				device_id: null,
				device_login_date: null,
			},
			{ where: { type: "Admin" } }
		);

		// Find any admin account
		const adminAccount = await User.findOne({ where: { type: "Admin" } });

		expect(adminAccount).not.toBeNull();

		const adminLoginRes = await request(app)
			.post("/api/web/auth/login")
			.send({
				username: String(adminAccount?.name),
				password: "admin123",  // Use the known password from migration
			});

		expect(adminLoginRes.status).toBe(200);
		adminToken = adminLoginRes.body.data.token;
		adminUserId = adminLoginRes.body.data.user_id;

		const createDepartmentRes = await request(app)
			.post("/api/web/admin/departments")
			.set(authHeader(adminToken))
			.send({
				company_name: `Unit Test Department ${uniqueSuffix}`,
				company_email: `unit-test-department-${uniqueSuffix}@company.local`,
				password: "dept12345",
				address: "Test Address",
				website: "https://example.com",
				description: "Department for router test",
				industry: "Technology",
			});

		expect(createDepartmentRes.status).toBe(201);
		departmentId = String(createDepartmentRes.body.data.departement_id);

		staffUsername = `Unit Test Staff ${uniqueSuffix}`;
		const createStaffRes = await request(app)
			.post("/api/web/admin/users/staff-account")
			.set(authHeader(adminToken))
			.send({
				username: staffUsername,
				role: "Manager",
				departement_id: departmentId,
			});

		expect(createStaffRes.status).toBe(201);
		staffUserId = String(createStaffRes.body.data.user_id);

		const staffLoginRes = await request(app)
			.post("/api/web/auth/login")
			.send({ username: staffUsername, password: staffPassword });

		expect(staffLoginRes.status).toBe(200);
		staffEmail = String(staffLoginRes.body.data.email);
		staffToken = staffLoginRes.body.data.token;
		staffQrCode = staffLoginRes.body.data.qr_code;
	});

	it("Login web auth", async () => {
		const adminAccount = await User.findOne({ where: { type: "Admin" } });

		expect(adminAccount).not.toBeNull();

		const res = await request(app)
			.post("/api/web/auth/login")
			.send({
				username: String(adminAccount?.name),
				password: "admin123",
			});

		expect(res.status).toBe(200);
		expect(res.body.data.token).toBeDefined();
	});

	it("Logout web auth", async () => {
		const res = await request(app)
			.post("/api/web/auth/logout")
			.set(authHeader(adminToken));

		expect(res.status).toBe(200);
	});

	it("Reset staff password", async () => {
		const res = await request(app)
			.put(`/api/web/auth/users/${staffEmail}/reset-password`)
			.set(authHeader(adminToken))
			.send({
				newPassword: updatedStaffPassword,
			});

		expect(res.status).toBe(200);
	});

	it("Create department", async () => {
		const res = await request(app)
			.post("/api/web/admin/departments")
			.set(authHeader(adminToken))
			.send({
				company_name: `Extra Department ${uniqueSuffix}`,
				company_email: `extra-department-${uniqueSuffix}@company.local`,
				password: "extra12345",
				address: "Extra Address",
				website: "https://example.org",
				description: "Temporary department",
				industry: "Operations",
			});

		expect(res.status).toBe(201);
	});

	it("Get all departments", async () => {
		const res = await request(app)
			.get("/api/web/departments")
			.set(authHeader(adminToken));

		expect(res.status).toBe(200);
	});

	it("Get department by id", async () => {
		const res = await request(app)
			.get(`/api/web/departments/${departmentId}`)
			.set(authHeader(adminToken));

		expect(res.status).toBe(200);
	});

	it("Update department", async () => {
		const res = await request(app)
			.put(`/api/web/admin/departments/${departmentId}`)
			.set(authHeader(adminToken))
			.send({
				company_name: `Unit Test Department Updated ${uniqueSuffix}`,
				website: "https://updated.example.com",
			});

		expect(res.status).toBe(200);
	});

	it("Delete department", async () => {
		const createTempDepartmentRes = await request(app)
			.post("/api/web/admin/departments")
			.set(authHeader(adminToken))
			.send({
				company_name: `Delete Department ${uniqueSuffix}`,
				company_email: `delete-department-${uniqueSuffix}@company.local`,
				password: "delete12345",
			});

		expect(createTempDepartmentRes.status).toBe(201);

		const tempDepartmentId = String(createTempDepartmentRes.body.data.departement_id);
		const deleteRes = await request(app)
			.delete(`/api/web/admin/departments/${tempDepartmentId}`)
			.set(authHeader(adminToken));

		expect(deleteRes.status).toBe(200);
	});

	it("Update admin profile", async () => {
		const res = await request(app)
			.put(`/api/web/admin/users/${adminUserId}`)
			.set(authHeader(adminToken))
			.send({
				alamat: "Head Office",
				nomor_telepon: "080000000000",
			});

		expect(res.status).toBe(200);
	});

	it("Update own staff profile", async () => {
		const res = await request(app)
			.put(`/api/web/staff/users/${staffUserId}/profile`)
			.set(authHeader(staffToken))
			.send({
				alamat: "Bandung",
				nomor_telepon: "081234567890",
				foto: "https://example.com/photo.jpg",
			});

		expect(res.status).toBe(200);
	});

	it("Verify QR code", async () => {
		const res = await request(app)
			.post("/api/web/qr/verify")
			.send({
				user_id: staffUserId,
				qr_code: staffQrCode,
			});

		expect(res.status).toBe(200);
	});

	it("Get user QR code", async () => {
		const res = await request(app).get(`/api/web/qr/${staffUserId}`);

		expect(res.status).toBe(200);
	});

	it("Create management tree", async () => {
		const res = await request(app)
			.post("/api/web/admin/management-tree")
			.set(authHeader(adminToken))
			.send({
				departement_name: `Management Tree ${uniqueSuffix}`,
				manager_user_id: staffUserId,
				staff_user_ids: [staffUserId],
			});

		expect(res.status).toBe(201);
		managementTreeDepartmentId = String(res.body.data.departement_id);
	});

	it("Update management tree", async () => {
		expect(managementTreeDepartmentId).not.toBe("");

		const res = await request(app)
			.put(`/api/web/admin/management-tree/${managementTreeDepartmentId}`)
			.set(authHeader(adminToken))
			.send({
				departement_name: `Management Tree Updated ${uniqueSuffix}`,
				manager_user_id: staffUserId,
				staff_user_ids: [staffUserId],
			});

		expect(res.status).toBe(200);
	});

	it("Generate attendance QR", async () => {
		const res = await request(app)
			.get("/api/web/attendance/qr")
			.set(authHeader(staffToken));

		expect(res.status).toBe(200);
		expect(res.body.data.qr_token).toBeDefined();
	});

	it("Clock in attendance by QR", async () => {
		const qrRes = await request(app)
			.get("/api/web/attendance/qr")
			.set(authHeader(staffToken));

		expect(qrRes.status).toBe(200);

		const res = await request(app)
			.post("/api/web/attendance/clock-in/qr-scan")
			.set(authHeader(staffToken))
			.send({ qr_token: qrRes.body.data.qr_token });

		expect(res.status).toBe(201);
		webAttendanceId = String(res.body.data.attendance_id ?? res.body.data.id ?? res.body.data.attendence_id);
	});

	it("Get attendance data", async () => {
		const res = await request(app)
			.get(`/api/web/attendance?user_id=${staffUserId}`)
			.set(authHeader(staffToken));

		expect(res.status).toBe(200);
	});

	it("Update attendance admin", async () => {
		expect(webAttendanceId).not.toBe("");

		const res = await request(app)
			.put(`/api/web/admin/attendance/${webAttendanceId}`)
			.set(authHeader(adminToken))
			.send({
				clock_out: new Date().toISOString(),
			});

		expect(res.status).toBe(200);
	});

	it("Clock out attendance staff", async () => {
		expect(webAttendanceId).not.toBe("");

		const res = await request(app)
			.delete(`/api/web/attendance/${webAttendanceId}/clock-out`)
			.set(authHeader(staffToken));

		expect(res.status).toBe(200);
	});

	it("Create leave request", async () => {
		const res = await request(app)
			.post("/api/web/leave-requests")
			.set(authHeader(staffToken))
			.send({
				user_id: staffUserId,
				reason: "Unit test leave request",
			});

		expect(res.status).toBe(201);
	});

	it("Approve leave request", async () => {
		const createRes = await request(app)
			.post("/api/web/leave-requests")
			.set(authHeader(staffToken))
			.send({
				user_id: staffUserId,
				reason: "Second unit test leave request",
			});

		expect(createRes.status).toBe(201);

		const leaveId = String(createRes.body.data.leave_id);
		const res = await request(app)
			.post(`/api/web/manager/leave-requests/${leaveId}/decision`)
			.set(authHeader(adminToken))
			.send({ approve: true });

		expect(res.status).toBe(200);
	});

	it("Get leave timeline", async () => {
		const res = await request(app)
			.get("/api/web/admin/leave-requests/timeline")
			.set(authHeader(adminToken));

		expect(res.status).toBe(200);
	});

	it("Create reimburse request", async () => {
		const res = await request(app)
			.post("/api/web/reimburse-requests")
			.set(authHeader(staffToken))
			.send({
				user_id: staffUserId,
				evidence: "https://example.com/receipt.pdf",
			});

		expect(res.status).toBe(201);
	});

	it("Approve reimburse request", async () => {
		const createRes = await request(app)
			.post("/api/web/reimburse-requests")
			.set(authHeader(staffToken))
			.send({
				user_id: staffUserId,
				evidence: "https://example.com/receipt-2.pdf",
			});

		expect(createRes.status).toBe(201);

		const reimburseId = String(createRes.body.data.reimburse_id);
		const res = await request(app)
			.post(`/api/web/manager/reimburse-requests/${reimburseId}/decision`)
			.set(authHeader(adminToken))
			.send({ approve: true });

		expect(res.status).toBe(200);
	});

	it("Set staff salary", async () => {
		const res = await request(app)
			.post("/api/web/admin/staff-salary")
			.set(authHeader(adminToken))
			.send({
				user_id: staffUserId,
				salary: 5000000,
			});

		expect(res.status).toBe(200);
	});

	it("Generate payroll", async () => {
		const res = await request(app)
			.post("/api/web/payroll/generate")
			.set(authHeader(adminToken))
			.send({
				name: staffUsername,
			});

		expect(res.status).toBe(201);
	});

	it("Create penalty", async () => {
		const res = await request(app)
			.post("/api/web/penalties")
			.set(authHeader(adminToken))
			.send({
				user_id: staffUserId,
				category: "late",
				note: "Unit test penalty",
				amount: 10000,
			});

		expect(res.status).toBe(201);
	});

	it("Login mobile auth", async () => {
		const res = await request(app)
			.get("/api/mobile/auth/login")
			.query({ username: staffUsername, password: updatedStaffPassword });

		expect(res.status).toBe(200);
		expect(res.body.data.token).toBeDefined();
	});

	it("Generate mobile attendance QR", async () => {
		const mobileLoginRes = await request(app)
			.get("/api/mobile/auth/login")
			.query({ username: staffUsername, password: updatedStaffPassword });

		expect(mobileLoginRes.status).toBe(200);
		const mobileToken = mobileLoginRes.body.data.token;

		const res = await request(app)
			.get("/api/mobile/attendance/qr")
			.set(authHeader(mobileToken));

		expect(res.status).toBe(200);
		expect(res.body.data.qr_token).toBeDefined();
	});

	it("Clock in mobile attendance by QR", async () => {
		const mobileLoginRes = await request(app)
			.get("/api/mobile/auth/login")
			.query({ username: staffUsername, password: updatedStaffPassword });

		expect(mobileLoginRes.status).toBe(200);
		const mobileToken = mobileLoginRes.body.data.token;

		const qrRes = await request(app)
			.get("/api/mobile/attendance/qr")
			.set(authHeader(mobileToken));

		expect(qrRes.status).toBe(200);

		const res = await request(app)
			.post("/api/mobile/attendance/clock-in/qr-scan")
			.set(authHeader(mobileToken))
			.send({ qr_token: qrRes.body.data.qr_token });

		expect(res.status).toBe(201);
		mobileAttendanceId = String(res.body.data.attendance_id ?? res.body.data.id ?? res.body.data.attendence_id);
	});

	it("Get mobile attendance data", async () => {
		const mobileLoginRes = await request(app)
			.get("/api/mobile/auth/login")
			.query({ username: staffUsername, password: updatedStaffPassword });

		expect(mobileLoginRes.status).toBe(200);
		const mobileToken = mobileLoginRes.body.data.token;

		const res = await request(app)
			.get(`/api/mobile/attendance?user_id=${staffUserId}`)
			.set(authHeader(mobileToken));

		expect(res.status).toBe(200);
	});

	it("Clock out mobile attendance", async () => {
		expect(mobileAttendanceId).not.toBe("");

		const mobileLoginRes = await request(app)
			.get("/api/mobile/auth/login")
			.query({ username: staffUsername, password: updatedStaffPassword });

		expect(mobileLoginRes.status).toBe(200);
		const mobileToken = mobileLoginRes.body.data.token;

		const res = await request(app)
			.delete(`/api/mobile/attendance/${mobileAttendanceId}/clock-out`)
			.set(authHeader(mobileToken));

		expect(res.status).toBe(200);
	});

	it("Reject login from another device when account already bound", async () => {
		const adminAccount = await User.findOne({ where: { type: "Admin" } });

		await User.update(
			{
				device_id: "locked-device-001",
				device_login_date: new Date().toISOString().split("T")[0],
			},
			{ where: { user_id: adminAccount?.user_id } }
		);

		const res = await request(app)
			.post("/api/web/auth/login")
			.send({
				username: String(adminAccount?.name),
				password: "admin123",
				device_id: "different-device-002",
			});

		expect(res.status).toBe(403);
		expect(res.body.message).toContain("already logged in on another device");
	});
});

afterAll(async () => {
	await sequelize.close();
});