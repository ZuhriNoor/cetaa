
import React, { useState } from "react";
import AttendeeSearch from "./AttendeeSearch";
import AttendeeDetails from "./AttendeeDetails";
import AttendanceForm from "./AttendanceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

interface AttendanceTrackerProps {
  category: string;
  title: string;
  description: string;
  badgeColor?: string;
}

const AttendanceTracker = ({ category, title, description, badgeColor = "default" }: AttendanceTrackerProps) => {
  const [search, setSearch] = useState("");
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (value.length === 0) {
      setFilteredAttendees([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/attendees?search=${value}&category=${category}`);
      const data = await res.json();
      setFilteredAttendees(data);
    } catch (err) {
      console.error("Search error:", err);
      setFilteredAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (attendee: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/attendees/${attendee._id || attendee.id}?category=${category}`);
      const data = await res.json();
      setSelectedAttendee(data);
      setSearch(data.name);
      setFilteredAttendees([]);
    } catch (err) {
      console.error("Select error:", err);
      setSelectedAttendee(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async () => {
    if (!selectedAttendee) {
      setStatus("Please select an attendee.");
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
          paymentMethod,
          category
        })
      });
      const data = await res.json();

      if (data.success) {
        setStatus("Attendance marked successfully!");
        setCouponCode("");
        setPaymentMethod("");
        setTimeout(() => {
          setSelectedAttendee(null);
          setSearch("");
          setStatus("");
        }, 2000);
      } else {
        setStatus(data.error || "Error marking attendance");
      }
    } catch (err) {
      console.error("Mark attendance error:", err);
      setStatus("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <Badge variant={badgeColor as any} className="text-sm">
            {category}
          </Badge>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Search & Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AttendeeSearch
            search={search}
            onSearch={handleSearch}
            results={filteredAttendees}
            onSelect={handleSelect}
            loading={loading}
          />
          
          {selectedAttendee && (
            <AttendeeDetails attendee={selectedAttendee} category={category} />
          )}
          
          {selectedAttendee && (
            <AttendanceForm
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onMark={handleMark}
              loading={loading}
              category={category}
            />
          )}
          
          {status && (
            <div className={`p-4 rounded-md ${
              status.includes("success") ? "bg-green-50 text-green-800 border border-green-200" : 
              status.includes("Error") ? "bg-red-50 text-red-800 border border-red-200" :
              "bg-blue-50 text-blue-800 border border-blue-200"
            }`}>
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracker;
