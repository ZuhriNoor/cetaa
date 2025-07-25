import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ExternalLink, FileSpreadsheet } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

interface SheetsLogViewerProps {
  category?: string;
}

interface SheetsData {
  timestamp: string;
  id: string;
  name: string;
  category: string;
  branch?: string;
  seatNumber?: string;
  year?: string;
  couponCode?: string;
  paymentMethod?: string;
  marked?: string;
}

function SheetsLogViewer({ category }: SheetsLogViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState(category || "golden-jubilee");
  const [data, setData] = useState<SheetsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSheetsData = async (cat: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/sheets/${cat}`);
      if (!res.ok) {
        throw new Error("Failed to fetch Google Sheets data");
      }
      const responseData = await res.json();
      setData(responseData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching sheets data:", err);
      setError("Failed to load Google Sheets data. Please check your Google Sheets configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetsData(selectedCategory);
  }, [selectedCategory]);

  const handleRefresh = () => {
    fetchSheetsData(selectedCategory);
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case "golden-jubilee":
        return "Golden Jubilee";
      case "silver-jubilee":
        return "Silver Jubilee";
      case "executives":
        return "Executives & Volunteers";
      case "other-alumni":
        return "Other Alumni";
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
      case "other-alumni":
        return "secondary";
      default:
        return "default";
    }
  };

  const getSheetUrl = (cat: string) => {
    const sheetIds = {
      'golden-jubilee': import.meta.env.VITE_GOOGLE_SHEETS_ID1,
      'silver-jubilee': import.meta.env.VITE_GOOGLE_SHEETS_ID2,
      'executives': import.meta.env.VITE_GOOGLE_SHEETS_ID3,
      'other-alumni': import.meta.env.VITE_GOOGLE_SHEETS_ID4
    };
    const sheetId = sheetIds[cat as keyof typeof sheetIds];
    return sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}` : null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Google Sheets Data</h1>
        <div className="flex justify-center mt-1 mb-2">
          <Badge variant={getCategoryBadgeColor(selectedCategory) as any} className="text-sm px-3 py-1 opacity-90">
            {getCategoryTitle(selectedCategory)}
          </Badge>
        </div>
        <p className="text-gray-200 max-w-2xl mx-auto">
          Live data from Google Sheets for {getCategoryTitle(selectedCategory).toLowerCase()}
        </p>
      </div>

      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Google Sheets Records
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="golden-jubilee">Golden Jubilee</SelectItem>
                    <SelectItem value="silver-jubilee">Silver Jubilee</SelectItem>
                    <SelectItem value="executives">Executives & Volunteers</SelectItem>
                    <SelectItem value="other-alumni">Other Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                className="text-xs"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              {getSheetUrl(selectedCategory) && (
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => window.open(getSheetUrl(selectedCategory), '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Sheet
                </Button>
              )}
            </div>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading Google Sheets data...
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data found in Google Sheets for {getCategoryTitle(selectedCategory).toLowerCase()}
              <br />
              <span className="text-sm">Make sure the Google Sheet exists and has data</span>
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
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {row.timestamp || '-'}
                      </TableCell>
                      <TableCell>{row.id || '-'}</TableCell>
                      <TableCell className="font-medium">{row.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {row.category || '-'}
                        </Badge>
                      </TableCell>
                      {selectedCategory !== 'executives' && (
                        <>
                          <TableCell>{row.branch || '-'}</TableCell>
                          <TableCell>{row.seatNumber || '-'}</TableCell>
                          <TableCell>{row.year || '-'}</TableCell>
                          <TableCell>{row.couponCode || '-'}</TableCell>
                          <TableCell>{row.paymentMethod || '-'}</TableCell>
                        </>
                      )}
                      {selectedCategory === 'executives' && (
                        <TableCell>
                          <Badge variant="default" className="text-xs">
                            {row.marked || '-'}
                          </Badge>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {data.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Total records: {data.length}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SheetsLogViewer; 