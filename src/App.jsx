import React, { useState } from "react";
import AttendeeSearch from "./components/AttendeeSearch";
import AttendeeDetails from "./components/AttendeeDetails";
import AttendanceForm from "./components/AttendanceForm";

const API_BASE = "http://localhost:5000"; // Change if backend runs elsewhere

function App() {
  const [search, setSearch] = useState("");
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Search attendees from backend
  const handleSearch = async (value) => {
    setSearch(value);
    if (value.length === 0) {
      setFilteredAttendees([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/attendees?search=${value}`);
      const data = await res.json();
      setFilteredAttendees(data);
    } catch (err) {
      setFilteredAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendee details from backend
  const handleSelect = async (attendee) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/attendees/${attendee._id || attendee.id}`);
      const data = await res.json();
      setSelectedAttendee(data);
      setSearch(data.name);
      setFilteredAttendees([]);
    } catch (err) {
      setSelectedAttendee(null);
    } finally {
      setLoading(false);
    }
  };

  // Submit attendance to backend
  const handleMark = async () => {
    if (!selectedAttendee || !paymentMethod) {
      setStatus("Please select an attendee and payment method.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeId: selectedAttendee._id || selectedAttendee.id,
          couponCode,
          paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Attendance marked!");
        setCouponCode("");
        setPaymentMethod("");
      } else {
        setStatus(data.error || "Error marking attendance");
      }
    } catch (err) {
      setStatus("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2>Event Attendance</h2>
      <AttendeeSearch
        search={search}
        onSearch={handleSearch}
        results={filteredAttendees}
        onSelect={handleSelect}
      />
      {loading && <div style={{ margin: 8 }}>Loading...</div>}
      {selectedAttendee && (
        <AttendeeDetails attendee={selectedAttendee} />
      )}
      {selectedAttendee && (
        <AttendanceForm
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onMark={handleMark}
        />
      )}
      {status && <div style={{ marginTop: 16, color: "green" }}>{status}</div>}
    </div>
  );
}

export default App;
