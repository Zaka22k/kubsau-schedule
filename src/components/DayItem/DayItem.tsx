import { useRef, useEffect } from "react";
import { type Day, type Lesson } from "@types";
import LessonItem from "./LessonItem";
import { Skeleton } from "@components";
import styles from "./DayItem.module.css";

interface DayItemProps {
  day?: Day;
}

const DayItem = ({ day }: DayItemProps) => {
  const dayRef = useRef<HTMLTableElement>(null);
  const isCurrent = day?.isToday;

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
      style={{ scrollMarginTop: "50px" }}
    >
      <thead>
        <tr className={styles.header}>
          {!day ? (
            <Skeleton width="60%" height="var(--subtitle-font)" />
          ) : (
            <>
              <th className={styles.weekday}>{day?.weekday}</th>
              <th className={styles.date}>{day?.date}</th>
            </>
          )}
        </tr>
      </thead>
      <tbody className={styles.body}>
        {day
          ? day?.lessons.map((lesson: Lesson, index: number) => (
              <LessonItem key={index} lesson={lesson} isToday={day.isToday} />
            ))
          : Array.from({ length: 7 }).map((_, index) => (
              <LessonItem key={index} lesson={undefined} isToday={false} />
            ))}
      </tbody>
    </table>
  );
};

export default DayItem;
