import { DayItem } from "@components";
import { type Day } from "@types";
import styles from "./WeekSection.module.css";

interface WeekSectionProps {
  days: Day[];
}

const WeekSection = ({ days = [] }: WeekSectionProps) => {
  return (
    <section className={styles.list}>
      {days.map((day, index) => (
        <DayItem key={index} day={day} index={index} />
      ))}
    </section>
  );
};

export default WeekSection;
