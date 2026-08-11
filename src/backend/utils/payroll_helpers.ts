const PAYROLL_LATE_FEE_PER_HOUR = 5000;
const PAYROLL_WORK_START_HOUR = 8;
const JAKARTA_OFFSET_HOURS = 7;
type PayrollPeriod = {
  start: Date;
  end: Date;
  label: string;
  key: string;
};

const clampDay = (day: number, maxDay: number) => Math.min(Math.max(day, 1), maxDay);

const addDays = (value: Date, days: number) => {
  const copy = new Date(value);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const getJakartaDateParts = (value: Date) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(value);
  const getPart = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((item) => item.type === type)?.value;
    return part ? Number(part) : 0;
  };

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
};

const toUtcFromJakartaLocal = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0) => {
  return new Date(Date.UTC(year, month - 1, day, hour - JAKARTA_OFFSET_HOURS, minute, second, millisecond));
};

export const getPayrollPeriod = (reference: Date, cutoffDay = reference.getDate()): PayrollPeriod => {
  const referenceParts = getJakartaDateParts(reference);
  const year = referenceParts.year;
  const month = referenceParts.month;
  const currentMonthLastDay = new Date(year, month, 0).getDate();
  const previousMonthLastDay = new Date(year, month - 1, 0).getDate();

  const safeCutoffDay = clampDay(cutoffDay, currentMonthLastDay);
  const safePreviousCutoffDay = clampDay(cutoffDay, previousMonthLastDay);

  const end = toUtcFromJakartaLocal(year, month, safeCutoffDay, 23, 59, 59, 999);
  const start = addDays(toUtcFromJakartaLocal(year, month - 1, safePreviousCutoffDay, 0, 0, 0, 0), 1);

  const label = end.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const key = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}`;

  return { start, end, label, key };
};

export const calculateLatePenalty = (clockInAt: Date) => {
  const parts = getJakartaDateParts(clockInAt);
  const hour = parts.hour;
  const minute = parts.minute;
  const minutesLate = Math.max(0, hour * 60 + minute - PAYROLL_WORK_START_HOUR * 60);
  const lateHours = minutesLate > 0 ? Math.ceil(minutesLate / 60) : 0;
  const amount = lateHours * PAYROLL_LATE_FEE_PER_HOUR;

  return {
    isLate: minutesLate > 0,
    minutesLate,
    lateHours,
    amount,
    workStartHour: PAYROLL_WORK_START_HOUR,
  };
};

export const PAYROLL_META = {
  lateFeePerHour: PAYROLL_LATE_FEE_PER_HOUR,
};
