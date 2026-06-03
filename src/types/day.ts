import { type Lesson } from "./lesson";

export interface Day {
  weekday: string;
  date: string;
  isToday: boolean;
  lessons: Lesson[];
}
