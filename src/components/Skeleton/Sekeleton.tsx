import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  shape?: "circle" | "rectangle";
}

const Skeleton = ({
  width = "100%",
  height = "12px",
  shape = "rectangle",
}: SkeletonProps) => {
  return (
    <div
      className={`${styles.skeleton} ${styles[shape]}`}
      style={{ width: width, height: height }}
    />
  );
};

export default Skeleton;
