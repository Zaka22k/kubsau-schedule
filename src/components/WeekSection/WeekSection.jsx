import { useEffect, useRef } from "react";
import { Day } from "@components";
import styles from "./WeekSection.module.css";

const WeekSection = ({ week, days = [], onRegister }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (onRegister && ref.current) {
      onRegister(week, ref.current);
    }
  }, [week, onRegister]);

  return (
    <section ref={ref} className={styles.list}>
      {days.map((day, index) => (
        <Day key={index} day={day} />
      ))}
    </section>
  );
};

export default WeekSection;
