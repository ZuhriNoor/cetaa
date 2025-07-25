
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
  transactionLastDigit: string;
  setTransactionLastDigit: (value: string) => void;
  numberOfFamilyMembers: string;
  setNumberOfFamilyMembers: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  onMark: () => void;
  loading?: boolean;
  category?: string;
}

function AttendanceForm({ 
  couponCode, 
  setCouponCode, 
  paymentMethod, 
  setPaymentMethod, 
  transactionLastDigit,
  setTransactionLastDigit,
  numberOfFamilyMembers,
  setNumberOfFamilyMembers,
  amount,
  setAmount,
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
          {category !== 'executives' && category !== 'other-alumni' && (
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
          {category !== 'executives' && category !== 'other-alumni' && (
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
          {(category === 'golden-jubilee' || category === 'silver-jubilee' || category === 'other-alumni') && (
            <div className="space-y-2">
              <Label htmlFor="transactionLastDigit">Last Digit of Transaction (Optional)</Label>
              <Input
                id="transactionLastDigit"
                type="text"
                value={transactionLastDigit}
                onChange={e => setTransactionLastDigit(e.target.value)}
                placeholder="Enter last digit of transaction if available"
              />
            </div>
          )}
          {(['golden-jubilee', 'silver-jubilee', 'executives', 'other-alumni'].includes(category)) && (
            <div className="space-y-2">
              <Label htmlFor="numberOfFamilyMembers">Number of Family Members (Optional)</Label>
              <Input
                id="numberOfFamilyMembers"
                type="number"
                min="0"
                value={numberOfFamilyMembers}
                onChange={e => setNumberOfFamilyMembers(e.target.value)}
                placeholder="Enter number of family members if any"
              />
            </div>
          )}
          {(['silver-jubilee', 'executives', 'other-alumni'].includes(category)) && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Optional)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount if any"
              />
            </div>
          )}
          {(['executives', 'other-alumni'].includes(category)) && (
            <div className="space-y-2">
              <Label htmlFor="transactionLastDigit">Last Digit of Transaction (Optional)</Label>
              <Input
                id="transactionLastDigit"
                type="text"
                maxLength={1}
                value={transactionLastDigit}
                onChange={e => setTransactionLastDigit(e.target.value)}
                placeholder="Enter last digit of transaction"
              />
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 font-semibold py-3 text-base"
            variant="default"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4" />
                Marking Attendance...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
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
