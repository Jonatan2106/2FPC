export type LeaveManagements = {
  leave_id: string;
  cuti: boolean;
  reason?: string;
  approvedAt?: Date;
  user?: {
    id: string;
    name?: string | null;
    departement?: string | null;
  };
  user_id?: string; // backward compatibility
  createdAt: Date;
  updatedAt: Date;
}