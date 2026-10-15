import { type Lesson, type LessonState } from "@types";
import { EXTERNAL_ROOM_LINKS } from "@consts";
import styles from "./LessonItem.module.css";

interface LessonItemProps {
  lesson: Lesson;
  state: LessonState;
}

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

const LessonItem = ({ lesson, state }: LessonItemProps) => {
  const isNow = state === "now";
  const hasRooms = lesson.rooms.length > 0;
  const links = hasRooms ? lesson.rooms : lesson.groups;
  const linkType = hasRooms ? 3 : 1;

  return (
    <tr className={cx(styles.lessonContainer, isNow && styles.now)}>
      <td className={cx(styles.times, isNow && styles.now)}>
        {lesson.startTime}
        <br />
        {lesson.endTime}
      </td>
      <td
        className={cx(styles.infoContainer, lesson.isLection && styles.lection)}
      >
        <div className={cx(styles.discipline, isNow && styles.now)}>
          {lesson.discipline} {lesson.isLection && "| Лекция"}
        </div>
        <div className={cx(styles.teachers, isNow && styles.now)}>
          {lesson.teachers.join(", ")}
        </div>
      </td>
      <td className={styles.whoWhere}>
        {links.map((item: string) => {
          const externalUrl = hasRooms ? EXTERNAL_ROOM_LINKS[item] : undefined;
          const href =
            externalUrl ??
            `./?type=${linkType}&value=${encodeURIComponent(item.replace(/\/\d+$/, ""))}`;

          return (
            <a
              key={item}
              className={cx(styles.link, isNow && styles.now)}
              href={href}
              {...(externalUrl && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
            >
              {item}
            </a>
          );
        })}
      </td>
    </tr>
  );
};

export default LessonItem;
