import { Fragment, useEffect, useRef } from "react";
import { Lesson } from "../Lesson";
import styles from "../Day.module.css";

const Day = (props) => {
  const {
    day = {
      name: "-",
      date: "-",
      isToday: false,
      lessons: [],
    },
  } = props;

  const dayRef = useRef(null);
  const isCurrent = day.isToday;

  useEffect(() => {
    if (isCurrent && dayRef.current) {
      setTimeout(() => {
        dayRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 167);
    }
  }, [isCurrent]);

  return (
    <table
      className={styles.cardContainer}
      ref={dayRef}
      style={{ scrollMarginTop: "50px" }}
    >
      <thead>
        <tr className={styles.title}>
          <th className={styles.name}>{day.name}</th>
          <th className={styles.date}>{day.date}</th>
        </tr>
      </thead>
      <tbody className={styles.lessons}>
        {day.lessons.map((lesson, index) => (
          <Lesson
            key={index}
            lesson={lesson}
            isLast={index === day.lessons.length - 1}
            isToday={day.isToday}
          />
        ))}
      </tbody>
    </table>
  );
};

export default Day;
