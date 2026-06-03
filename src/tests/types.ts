export interface Lesson {
  startTime: string;
  endTime: string;
  isLection: boolean;
  discipline: string;
  teachers: string[];
  rooms: string[];
  groups: string[];
  isNow: boolean;
}

export interface Day {
  weekday: string;
  date: string;
  isToday: boolean;
  lessons: Lesson[];
}

export type Week = Day[];

export interface Schedule {
  weeks: Record<number, Week>;
  currentWeek?: number;
}
