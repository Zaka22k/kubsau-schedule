export interface Lesson {
  number: number;
  startTime: string;
  endTime: string;
  isLection: boolean;
  discipline: string;
  teachers: string[];
  rooms: string[];
  groups: string[];
}

export interface Day {
  weekday: string;
  date: string;
  dateLabel: string;
  lessons: Lesson[];
}

export type Week = Day[];

export interface Schedule {
  weeks: Record<number, Week>;
}

export interface Suggestion {
  id: string;
  value: string;
  type: string;
}

export interface Now {
  isoDate: string;
  minutes: number;
}

export type LessonState = "past" | "now" | "soon" | "upcoming";
