export type LeaveManagements = {
  leave_id: string;
  user_id: string;
  cuti: boolean;
  reason?: string;
  createdAt: Date;
  approvedAt?: Date;
  updatedAt: Date;
}