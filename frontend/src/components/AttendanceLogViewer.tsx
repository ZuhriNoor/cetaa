import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, Calendar, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

interface AttendanceLogViewerProps {
  category?: string;
}

interface AttendanceLog {
  timestamp: string;
  id: number;
  name: string;
  category: string;
  branch?: string;
  seatNumber?: string;
  year?: string;
  couponCode?: string;
  paymentMethod?: string;
  marked?: string;
}

function AttendanceLogViewer({ category }: AttendanceLogViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState(category || "golden-jubilee");
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async (cat: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/attendance/${cat}`);
      if (!res.ok) {
        throw new Error("Failed to fetch attendance logs");
      }
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(selectedCategory);
  }, [selectedCategory]);

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case "golden-jubilee":
        return "Golden Jubilee";
      case "silver-jubilee":
        return "Silver Jubilee";
      case "executives":
        return "Executives & Volunteers";
      default:
        return cat;
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "golden-jubilee":
        return "default";
      case "silver-jubilee":
        return "secondary";
      case "executives":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Logs</h1>
          <Badge variant={getCategoryBadgeColor(selectedCategory) as any} className="text-sm">
            {getCategoryTitle(selectedCategory)}
          </Badge>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          View attendance records for {getCategoryTitle(selectedCategory).toLowerCase()}
        </p>
      </div>

      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendance Records
            </CardTitle>
            <div className="w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading attendance logs...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for {getCategoryTitle(selectedCategory).toLowerCase()}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    {selectedCategory !== 'executives' && (
                      <>
                        <TableHead>Branch</TableHead>
                        <TableHead>Seat No</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Coupon Code</TableHead>
                        <TableHead>Payment Method</TableHead>
                      </>
                    )}
                    {selectedCategory === 'executives' && (
                      <TableHead>Status</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.id}</TableCell>
                      <TableCell className="font-medium">{log.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.category}
                        </Badge>
                      </TableCell>
                      {selectedCategory !== 'executives' && (
                        <>
                          <TableCell>{log.branch}</TableCell>
                          <TableCell>{log.seatNumber}</TableCell>
                          <TableCell>{log.year}</TableCell>
                          <TableCell>{log.couponCode || "-"}</TableCell>
                          <TableCell>{log.paymentMethod || "-"}</TableCell>
                        </>
                      )}
                      {selectedCategory === 'executives' && (
                        <TableCell>
                          <Badge variant="default" className="text-xs">
                            {log.marked}
                          </Badge>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {logs.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Total records: {logs.length}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceLogViewer; 