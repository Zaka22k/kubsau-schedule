import { type Week } from "./week";

export interface Schedule {
  weeks: Record<number, Week>;
  currentWeek?: number;
}
