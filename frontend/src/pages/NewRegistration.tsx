
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const NewRegistration = () => {
  console.log(API_BASE)
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    branch: "",
    year: "",
    seatNumber: "",
    couponCode: "",
    paymentMethod: "",
    transactionLastDigit: "",
    numberOfFamilyMembers: "",
    amount: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/attendance/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          branch: formData.branch,
          year: formData.year,
          seatNumber: formData.category === 'silver-jubilee' ? undefined : formData.seatNumber,
          couponCode: formData.couponCode,
          paymentMethod: formData.paymentMethod,
          transactionLastDigit: formData.transactionLastDigit,
          numberOfFamilyMembers: ['silver-jubilee', 'executives', 'other-alumni'].includes(formData.category) ? formData.numberOfFamilyMembers : undefined,
          amount: ['silver-jubilee', 'executives', 'other-alumni'].includes(formData.category) ? formData.amount : undefined
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Registration Successful!",
          description: `${formData.name} has been registered as a ${formData.category.replace('-', ' ')} member and marked present.` + (formData.category === 'silver-jubilee' && data.attendee?.seatNumber ? `\nAssigned Seat Number: ${data.attendee.seatNumber}` : ''),
        });
        // Reset form, always clear seat number
        setFormData(prev => ({
          name: "",
          category: prev.category,
          branch: "",
          year: "",
          seatNumber: "",
          couponCode: "",
          paymentMethod: "",
          transactionLastDigit: "",
          numberOfFamilyMembers: "",
          amount: ""
        }));
      } else {
        throw new Error(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast({
        title: "Registration Failed",
        description: "There was an error registering the attendee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-white">New Registration</h1>
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-200 max-w-2xl mx-auto">
          Register new attendees for the event. Please fill in all required information to complete the registration process.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Member Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="golden-jubilee">Golden Jubilee</SelectItem>
                    <SelectItem value="silver-jubilee">Silver Jubilee</SelectItem>
                    <SelectItem value="executives">Executives</SelectItem>
                    <SelectItem value="other-alumni">Other alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Branch and Year always required */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  type="text"
                  value={formData.branch}
                  onChange={e => handleInputChange("branch", e.target.value)}
                  placeholder="Enter branch"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="text"
                  value={formData.year}
                  onChange={e => handleInputChange("year", e.target.value)}
                  placeholder="Enter year"
                />
              </div>
            </div>
            {/* Seat number only for golden/silver/jubilee/executives, optional */}
            {(formData.category === 'golden-jubilee' || formData.category === 'silver-jubilee' || formData.category === 'executives') && (
              <div className="space-y-2">
                <Label htmlFor="seatNumber">Seat Number (Optional)</Label>
                <Input
                  id="seatNumber"
                  type="text"
                  value={formData.seatNumber}
                  onChange={e => handleInputChange("seatNumber", e.target.value)}
                  placeholder="Enter seat number (optional)"
                  readOnly={formData.category === 'silver-jubilee'}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
              <Input
                id="couponCode"
                type="text"
                value={formData.couponCode}
                onChange={e => handleInputChange("couponCode", e.target.value)}
                placeholder="Enter coupon code if available"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
              <Select value={formData.paymentMethod} onValueChange={value => handleInputChange("paymentMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="No Payment">No Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.category === 'golden-jubilee' || formData.category === 'silver-jubilee') && (
              <div className="space-y-2">
                <Label htmlFor="transactionLastDigit">Last Digit of Transaction (Optional)</Label>
                <Input
                  id="transactionLastDigit"
                  type="text"
                  value={formData.transactionLastDigit}
                  onChange={e => handleInputChange("transactionLastDigit", e.target.value)}
                  placeholder="Enter last four digits of transaction"
                />
              </div>
            )}
            {(['executives', 'other-alumni'].includes(formData.category)) && (
              <div className="space-y-2">
                <Label htmlFor="transactionLastDigit">Last Digit of Transaction (Optional)</Label>
                <Input
                  id="transactionLastDigit"
                  type="text"
                  value={formData.transactionLastDigit}
                  onChange={e => handleInputChange("transactionLastDigit", e.target.value)}
                  placeholder="Enter last digit of transaction"
                />
              </div>
            )}
            {/* Number of Family Members and Amount for silver-jubilee, executives, other-alumni */}
            {(['silver-jubilee', 'executives', 'other-alumni'].includes(formData.category)) && (
              <div className="space-y-2">
                <Label htmlFor="numberOfFamilyMembers">Number of Food Coupons (Optional)</Label>
                <Input
                  id="numberOfFamilyMembers"
                  type="number"
                  min="0"
                  value={formData.numberOfFamilyMembers}
                  onChange={e => handleInputChange("numberOfFamilyMembers", e.target.value)}
                  placeholder="Enter number of food coupon"
                />
              </div>
            )}
            {(['silver-jubilee', 'executives', 'other-alumni'].includes(formData.category)) && (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={e => handleInputChange("amount", e.target.value)}
                  placeholder="Enter amount"
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
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Register Attendee
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRegistration;
