import { useRef, useEffect, type CSSProperties } from "react";
import { type Day, type Lesson, type Now } from "@types";
import { getLessonState } from "@utils";
import LessonItem from "./LessonItem";
import styles from "./DayItem.module.css";

interface DayItemProps {
  day?: Day;
  now: Now;
  index?: number;
}

const DayItem = ({ day, now, index = 0 }: DayItemProps) => {
  const dayRef = useRef<HTMLTableElement>(null);
  const isCurrent = day?.date === now.isoDate;

  useEffect(() => {
    const currentDayElement = dayRef.current;

    if (isCurrent && currentDayElement) {
      const timer = setTimeout(() => {
        currentDayElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 167);

      return () => clearTimeout(timer);
    }
  }, [isCurrent]);

  return (
    <table
      className={styles.card}
      ref={dayRef}
      style={{ scrollMarginTop: "50px", "--i": index } as CSSProperties}
    >
      <thead>
        <tr className={styles.header}>
          <th className={styles.weekday}>{day?.weekday}</th>
          <th className={styles.date}>{day?.dateLabel}</th>
        </tr>
      </thead>
      <tbody className={styles.body}>
        {day?.lessons.map((lesson: Lesson) => (
          <LessonItem
            key={lesson.number}
            lesson={lesson}
            state={getLessonState(day, lesson, now)}
          />
        ))}
      </tbody>
    </table>
  );
};

export default DayItem;
