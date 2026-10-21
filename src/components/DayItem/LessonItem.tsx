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
      <td className={styles.times}>
        {lesson.startTime}
        <br />
        {lesson.endTime}
      </td>
      <td className={`${lesson.isLection && styles.badge}`} />
      <td className={styles.infoContainer}>
        <div className={styles.discipline}>{lesson.discipline}</div>
        <div className={styles.teachers}>{lesson.teachers.join(", ")}</div>
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
              className={styles.link}
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
