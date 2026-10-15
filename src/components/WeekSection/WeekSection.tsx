import { DayItem } from "@components";
import { type Day, type Now } from "@types";
import styles from "./WeekSection.module.css";

interface WeekSectionProps {
  days: Day[];
  now: Now;
}

const WeekSection = ({ days = [], now }: WeekSectionProps) => {
  return (
    <section className={styles.list}>
      {days.map((day, index) => (
        <DayItem key={day.date} day={day} index={index} now={now} />
      ))}
    </section>
  );
};

export default WeekSection;
