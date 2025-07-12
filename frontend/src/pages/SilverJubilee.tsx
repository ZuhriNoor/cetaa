
import React from "react";
import AttendanceTracker from "../components/AttendanceTracker";

const SilverJubilee = () => {
  return (
    <AttendanceTracker
      category="silver-jubilee"
      title="Silver Jubilee Members"
      description="Mark attendance for Silver Jubilee members. These members have shown consistent commitment and dedication to our organization."
      badgeColor="secondary"
    />
  );
};

export default SilverJubilee;
