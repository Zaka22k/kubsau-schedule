import { DayCard, WeekDivider } from "@components";
import styles from "./WeekSection.module.css";

const WeekSection = ({ weekNumber = 1, days = [] }) => {
  return (
    <section className={styles.section}>
      <WeekDivider>Неделя {weekNumber}</WeekDivider>

      <div className={styles.list}>
        {days.map((day, index) => (
          <DayCard key={index} day={day} />
        ))}
      </div>
    </section>
  );
};

export default WeekSection;
