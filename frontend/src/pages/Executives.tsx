
import React from "react";
import AttendanceTracker from "../components/AttendanceTracker";

const Executives = () => {
  return (
    <AttendanceTracker
      category="executives"
      title="Executives & Volunteers"
      description="Mark attendance for executives, volunteers, and staff members who help organize and manage our events."
      badgeColor="outline"
    />
  );
};

export default Executives;
