export type Penalty = {
  penalty_id: string;
  category: 'Unpaid Cuti' | 'Broken Stuff' | 'Late' | 'Other';
  notes: string | null;
  amount: number;
}