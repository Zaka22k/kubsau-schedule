import styles from "../LessonItem.module.css";

const LessonItem = (props) => {
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
                href={`./?type=${lesson.rooms.length > 0 ? 3 : 1}&value=${item.replace(/\/\d+$/, "")}`}
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

export default LessonItem;
