
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Tag } from "lucide-react";

interface AttendeeDetailsProps {
  attendee: {
    name: string;
    email: string;
    phone: string;
    category?: string;
    registrationDate?: string;
  };
}

function AttendeeDetails({ attendee }: AttendeeDetailsProps) {
  if (!attendee) return null;
  
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Selected Attendee
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{attendee.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{attendee.email}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{attendee.phone}</span>
          </div>
          
          {attendee.category && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <Badge variant="secondary">{attendee.category}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AttendeeDetails;
