export type Reimburse = {
  reimburse_id: string;
  amount: number;
  approve: "APPROVED" | "REJECTED" | "PENDING";
  evidence?: string;
  approvedAt?: Date | null;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
};