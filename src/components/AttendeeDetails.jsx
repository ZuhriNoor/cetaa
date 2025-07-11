import React from "react";

function AttendeeDetails({ attendee }) {
  if (!attendee) return null;
  return (
    <div style={{ margin: "16px 0", padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
      <h4 style={{ margin: 0 }}>{attendee.name}</h4>
      <div>Email: {attendee.email}</div>
      <div>Phone: {attendee.phone}</div>
    </div>
  );
}

export default AttendeeDetails; 