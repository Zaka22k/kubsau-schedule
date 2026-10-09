import { type ReactNode } from "react";
import { GlassPanel } from "../GlassPanel";
import styles from "./StatusScreen.module.css";

type StatusScreenProps = {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "accent" | "neutral";
};

const StatusScreen = ({
  icon,
  title,
  description,
  action,
  tone = "neutral",
}: StatusScreenProps) => (
  <div className={styles.centerContainer}>
    <div className={styles.statusCard}>
      <GlassPanel
        style={{ width: 64, height: 64 }}
        className={`${styles.iconWrap} ${styles[tone]}`}
      >
        {icon}
      </GlassPanel>
      <h2 className={styles.statusTitle}>{title}</h2>
      {description && <p className={styles.statusText}>{description}</p>}
      {action}
    </div>
  </div>
);

export default StatusScreen;
