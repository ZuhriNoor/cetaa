
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
    address: "",
    emergencyContact: "",
    notes: ""
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
      const res = await fetch(`${API_BASE}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success || res.ok) {
        toast({
          title: "Registration Successful!",
          description: `${formData.name} has been registered as a ${formData.category} member.`,
        });
        
        // Reset form
        setFormData({
          name: "",
          category: "",
          branch: "",
          year: "",
          seatNumber: "",
          address: "",
          emergencyContact: "",
          notes: ""
        });
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
          <h1 className="text-3xl font-bold text-gray-900">New Registration</h1>
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
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
                    <SelectItem value="executives">Executives & Volunteers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  type="text"
                  value={formData.branch}
                  onChange={e => handleInputChange("branch", e.target.value)}
                  placeholder="Enter branch (e.g., Computer Science)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="text"
                  value={formData.year}
                  onChange={e => handleInputChange("year", e.target.value)}
                  placeholder="Enter year (e.g., 1995)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatNumber">Seat Number</Label>
              <Input
                id="seatNumber"
                type="text"
                value={formData.seatNumber}
                onChange={e => handleInputChange("seatNumber", e.target.value)}
                placeholder="Enter seat number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={e => handleInputChange("address", e.target.value)}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input
                id="emergency"
                type="text"
                value={formData.emergencyContact}
                onChange={e => handleInputChange("emergencyContact", e.target.value)}
                placeholder="Emergency contact name and number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information or special requirements"
                rows={2}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
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
