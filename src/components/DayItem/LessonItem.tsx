import { type Lesson } from "@types";
import { Skeleton } from "@components";
import styles from "./LessonItem.module.css";

interface LessonItemProps {
  lesson?: Lesson;
  isToday?: boolean;
}

const LessonItem = ({ lesson, isToday }: LessonItemProps) => {
  return (
    <tr
      className={`${styles.lessonContainer} ${lesson?.isNow && isToday && styles.now}`}
    >
      <td
        className={`${styles.times} ${lesson?.isNow && isToday && styles.now}`}
      >
        {!lesson ? (
          <Skeleton width="30%" />
        ) : (
          <>
            {lesson.startTime}
            <br />
            {lesson.endTime}
          </>
        )}
      </td>
      <td
        className={`${styles.infoContainer} ${lesson?.isLection && styles.lection}`}
      >
        <div
          className={`${styles.discipline} ${lesson?.isNow && isToday && styles.now}`}
        >
          {!lesson ? <Skeleton width="70%" /> : lesson.discipline}
        </div>
        <div
          className={`${styles.teachers} ${lesson?.isNow && isToday && styles.now}`}
        >
          {!lesson ? <Skeleton width="30%" /> : lesson.teachers.join(", ")}
        </div>
      </td>
      <td className={styles.whoWhere}>
        {!lesson ? (
          <Skeleton width="30%" />
        ) : (
          (lesson.rooms.length > 0 ? lesson.rooms : lesson.groups).map(
            (item: string) => (
              <a
                key={item}
                className={`${styles.link} ${lesson.isNow && isToday && styles.now}`}
                href={`./?type=${lesson.rooms.length > 0 ? 3 : 1}&value=${item.replace(/\/\d+$/, "")}`}
              >
                {item}
              </a>
            ),
          )
        )}
      </td>
    </tr>
  );
};

export default LessonItem;
