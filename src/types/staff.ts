import type { User } from "./user";

export type Staff = {
  user: User;
  salary: number;
  hire_date: Date;
  role: 'STAFF' | 'MANAGER';
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