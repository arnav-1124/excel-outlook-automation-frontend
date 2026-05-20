import { useState } from "react";
import { getActivityTime } from "../utils/dateUtils";

function useActivityLog() {
  const [activityLog, setActivityLog] = useState([]);

  function addActivity(type, message) {
    const newActivity = {
      id: Date.now(),
      type,
      message,
      time: getActivityTime(),
    };

    setActivityLog((previousLog) => [newActivity, ...previousLog].slice(0, 8));
  }

  function clearActivityLog() {
    setActivityLog([]);
  }

  return {
    activityLog,
    addActivity,
    clearActivityLog,
  };
}

export default useActivityLog;