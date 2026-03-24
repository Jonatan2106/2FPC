import type { User } from "./user";

export type Staff = {
  user: User;
  QR: string;
  hire_date: Date;
  role: 'STAFF' | 'MANAGER';
  department_id: string;
  roleBehavior: RoleBehavior;
  manager_id: string | null;
};

export interface RoleBehavior {
  canCreateUser: boolean;
  canApproveLeave: boolean;
  canApproveReimbure: boolean;
  canAccessReports: boolean;
  canAddPenalty: boolean;
}