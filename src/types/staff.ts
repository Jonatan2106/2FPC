import type { User } from "./user";

export type Staff = {
  user: User;
  name?: string | null;
  departement_name?: string | null;
  hire_date?: Date | string | null;
  role: "Staff" | "Manager";
  departement_id?: string | null;
  departement_data?: {
    company_name: string;
  };
  roleBehavior?: RoleBehavior;
  manager_id?: string | null;
};

export interface RoleBehavior {
  canCreateUser: boolean;
  canApproveLeave: boolean;
  canApproveReimbure: boolean;
  canAccessReports: boolean;
  canAddPenalty: boolean;
}