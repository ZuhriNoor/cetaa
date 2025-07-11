import React from "react";

function AttendanceForm({ couponCode, setCouponCode, paymentMethod, setPaymentMethod, onMark }) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onMark();
      }}
      style={{ marginTop: 12 }}
    >
      <div style={{ marginBottom: 8 }}>
        <label>Coupon Code: </label>
        <input
          type="text"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          style={{ padding: 6, width: "60%" }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Payment Method: </label>
        <select
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="">Select</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
      </div>
      <button type="submit" style={{ padding: "8px 20px", fontSize: 16 }}>
        Mark
      </button>
    </form>
  );
}

export default AttendanceForm; 