
import React from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface AttendeeSearchProps {
  search: string;
  onSearch: (value: string) => void;
  results: any[];
  onSelect: (attendee: any) => void;
  loading?: boolean;
}

function AttendeeSearch({ search, onSearch, results, onSelect, loading }: AttendeeSearchProps) {
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search attendee by name..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="pl-10"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>
      
      {results.length > 0 && (
        <Card className="absolute left-0 right-0 mt-1 z-10 max-h-60 overflow-y-auto">
          <div className="py-2">
            {results.map(attendee => (
              <div
                key={attendee.id || attendee._id}
                onClick={() => onSelect(attendee)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
              >
                <div className="font-medium text-gray-900">{attendee.name}</div>
                {attendee.email && (
                  <div className="text-sm text-gray-500">{attendee.email}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AttendeeSearch;
