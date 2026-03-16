import type { Staff } from "./staff";

export type Attendance = {
  staff: Staff;
  attendance_id: string;
  check_in: Date;
  check_out: Date;
}