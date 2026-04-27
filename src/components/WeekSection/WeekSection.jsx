import { DayCard } from "@components";
import styles from "./WeekSection.module.css";

const WeekSection = ({ days = [] }) => {
  return (
    <section className={styles.list}>
      {days.map((day, index) => (
        <DayCard key={index} day={day} />
      ))}
    </section>
  );
};

export default WeekSection;
