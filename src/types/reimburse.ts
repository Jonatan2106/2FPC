export type Reimburse = {
  reimburse_id: string;
  approve: boolean;
  amount?: number;
  evidence?: string;
  approvedAt?: Date | null;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
};