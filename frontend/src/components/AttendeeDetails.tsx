
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Tag } from "lucide-react";

interface AttendeeDetailsProps {
  attendee: {
    name: string;
    category?: string;
    branch?: string;
    year?: string;
    seatNumber?: string;
    marked?: boolean;
  };
  category: string;
}

function AttendeeDetails({ attendee, category }: AttendeeDetailsProps) {
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
          
          {attendee.category && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <Badge variant="secondary">{attendee.category}</Badge>
            </div>
          )}
          
          {category !== 'executives' && attendee.branch && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{attendee.branch}</span>
            </div>
          )}
          
          {category !== 'executives' && attendee.year && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{attendee.year}</span>
            </div>
          )}
          
          {category !== 'executives' && attendee.seatNumber && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{attendee.seatNumber}</span>
            </div>
          )}
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Status:</span> 
          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
            attendee.marked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {attendee.marked ? 'Marked' : 'Not Marked'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default AttendeeDetails;
