
import React from "react";
import AttendanceTracker from "../components/AttendanceTracker";

const GoldenJubilee = () => {
  return (
    <AttendanceTracker
      category="golden-jubilee"
      title="Golden Jubilee Members"
      description="Mark attendance for Golden Jubilee members. These are our most valued long-term members who have been with us for decades."
      badgeColor="default"
    />
  );
};

export default GoldenJubilee;
