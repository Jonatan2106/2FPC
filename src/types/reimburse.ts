export type Reimburse = {
  reimburse_id: string;
  approve: boolean;
  amount?: number;
  evidence?: string;
  approvedAt?: Date | null;
  user?: {
    id: string;
    name?: string | null;
    departement?: string | null;
  };
  user_id?: string; // kept for backward compatibility
  createdAt: Date;
  updatedAt: Date;
};