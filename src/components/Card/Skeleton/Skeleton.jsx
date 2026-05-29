import { Fragment } from "react";
import dayStyles from "../Day.module.css";
import lessonStyles from "../Lesson.module.css";
import skeletonStyles from "./Skeleton.module.css";

const Skelet = ({ width = "100%", height = "12px", shape = "rectangle" }) => {
  return (
    <div
      className={`${skeletonStyles.skeleton} ${skeletonStyles[shape]}`}
      style={{ width: width, height: height }}
    />
  );
};

const Skeleton = () => {
  return (
    <table className={dayStyles.cardContainer}>
      <thead>
        <tr className={dayStyles.title}>
          <Skelet width="60%" height="var(--subtitle-font)" />
        </tr>
      </thead>
      <tbody className={dayStyles.lessons}>
        {[1, 2, 3, 4, 5, 6].map((lesson) => (
          <Fragment key={`lesson-${lesson}`}>
            <tr className={lessonStyles.lessonContainer}>
              <td className={`${lessonStyles.times}`}>
                <Skelet width="30px" />
              </td>
              <td
                className={`${lessonStyles.infoContainer} ${skeletonStyles.infoContainer}`}
              >
                <div className={lessonStyles.discipline}>
                  <Skelet width="70%" />
                </div>
                <div className={lessonStyles.teachers}>
                  <Skelet width="30%" />
                </div>
              </td>
              <td className={lessonStyles.whoWhere}>
                <Skelet width="30px" />
              </td>
            </tr>
          </Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default Skeleton;
