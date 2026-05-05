import { Fragment } from "react";
import dayStyles from "../DayItem.module.css";
import lessonStyles from "../LessonItem.module.css";
import skeletonStyles from "./Skeleton.module.css";

const Skeleton = ({ width = "100%", height = "12px", shape = "rectangle" }) => {
  return (
    <div
      className={`${skeletonStyles.skeleton} ${skeletonStyles[shape]}`}
      style={{ width: width, height: height }}
    />
  );
};

const SkeletonItem = () => {
  return (
    <table className={dayStyles.cardContainer}>
      <thead>
        <tr className={dayStyles.title}>
          <Skeleton width="60%" height="var(--subtitle-font)" />
        </tr>
      </thead>
      <tbody className={dayStyles.lessons}>
        {[1, 2, 3, 4, 5, 6].map((lesson) => (
          <Fragment key={`lesson-${lesson}`}>
            <tr className={lessonStyles.lessonContainer}>
              <td className={`${lessonStyles.times}`}>
                <Skeleton width="30px" />
              </td>
              <td
                className={`${lessonStyles.infoContainer} ${skeletonStyles.infoContainer}`}
              >
                <div className={lessonStyles.discipline}>
                  <Skeleton width="70%" />
                </div>
                <div className={lessonStyles.teachers}>
                  <Skeleton width="30%" />
                </div>
              </td>
              <td className={lessonStyles.whoWhere}>
                <Skeleton width="30px" />
              </td>
            </tr>
            {lesson !== 6 && <tr className={dayStyles.divider}></tr>}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default SkeletonItem;
