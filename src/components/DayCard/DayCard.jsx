import { Fragment, useEffect, useRef } from "react";
import styles from "./DayCard.module.css";

const DayCard = (props) => {
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
      }, 100);
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
          <th className={`${styles.date} ${day.isToday && styles.today}`}>
            {day.isToday ? "Сегодня" : day.date}
          </th>
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

export default DayCard;

const Lesson = (props) => {
  const {
    lesson = {
      startTime: "--:--",
      endTime: "--:--",
      isLection: false,
      discipline: "-",
      teachers: [],
      rooms: [],
      groups: [],
      isNow: false,
    },
    isLast = false,
    isToday = false,
  } = props;

  return (
    <>
      <tr className={styles.lessonContainer}>
        <td
          className={`${styles.times} ${lesson.isNow && isToday && styles.now}`}
        >
          {lesson.startTime}
          <br />
          {lesson.endTime}
        </td>
        <td
          className={`${styles.infoContainer} ${lesson.isLection && styles.lection}`}
        >
          <div className={styles.discipline}>{lesson.discipline}</div>
          <div className={styles.teachers}>{lesson.teachers.join(", ")}</div>
        </td>
        <td className={styles.whoWhere}>
          {(lesson.rooms.length > 0 ? lesson.rooms : lesson.groups).map(
            (item) => (
              <a
                key={item}
                href={`./?t=${lesson.rooms.length > 0 ? 3 : 1}&v=${item}`}
              >
                {item}
              </a>
            ),
          )}
        </td>
      </tr>
      {!isLast && <tr className={styles.divider}></tr>}
    </>
  );
};
