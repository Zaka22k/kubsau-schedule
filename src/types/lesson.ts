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
