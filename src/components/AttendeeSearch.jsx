import React from "react";

function AttendeeSearch({ search, onSearch, results, onSelect }) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search attendee by name..."
        value={search}
        onChange={e => onSearch(e.target.value)}
        style={{ width: "100%", padding: 8, fontSize: 16 }}
        autoComplete="off"
      />
      {results.length > 0 && (
        <ul style={{
          position: "absolute",
          left: 0,
          right: 0,
          background: "#000",
          border: "1px solid #ccc",
          margin: 0,
          padding: 0,
          listStyle: "none",
          zIndex: 10,
          maxHeight: 180,
          overflowY: "auto",
          color: "#fff",
        }}>
          {results.map(attendee => (
            <li
              key={attendee.id}
              onClick={() => onSelect(attendee)}
              style={{ padding: 8, cursor: "pointer" }}
            >
              {attendee.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AttendeeSearch; 