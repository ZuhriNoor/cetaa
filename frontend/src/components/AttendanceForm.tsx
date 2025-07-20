
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

interface AttendanceFormProps {
  couponCode: string;
  setCouponCode: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onMark: () => void;
  loading?: boolean;
  category?: string;
}

function AttendanceForm({ 
  couponCode, 
  setCouponCode, 
  paymentMethod, 
  setPaymentMethod, 
  onMark,
  loading,
  category
}: AttendanceFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Mark Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            onMark();
          }}
          className="space-y-4"
        >
          {category !== 'executives' && (
            <div className="space-y-2">
              <Label htmlFor="coupon">Coupon Code (Optional)</Label>
              <Input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Enter coupon code if available"
              />
            </div>
          )}
          
          {category !== 'executives' && (
            <div className="space-y-2">
              <Label htmlFor="payment">Payment Method (Optional)</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="No Payment">No Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Marking Attendance...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Attendance
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default AttendanceForm;
