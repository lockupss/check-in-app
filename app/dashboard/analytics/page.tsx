'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Footer from '@/components/Footer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [registers, setRegisters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/register/all');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setRegisters(data);
        processChartData(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const processChartData = (data: any[]) => {
    const dateMap = new Map<string, { checkIns: number, checkOuts: number }>();
    
    // Process all records
    data.forEach(record => {
      const inDate = record.inTime?.split('T')[0];
      const outDate = record.outTime?.split('T')[0];
      
      // Process check-ins
      if (inDate) {
        if (!dateMap.has(inDate)) {
          dateMap.set(inDate, { checkIns: 0, checkOuts: 0 });
        }
        dateMap.get(inDate)!.checkIns++;
      }
      
      // Process check-outs
      if (outDate) {
        if (!dateMap.has(outDate)) {
          dateMap.set(outDate, { checkIns: 0, checkOuts: 0 });
        }
        dateMap.get(outDate)!.checkOuts++;
      }
    });
    
    // Convert to array and sort by date
    const processedData = Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        'Check-Ins': counts.checkIns,
        'Check-Outs': counts.checkOuts
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setChartData(processedData);
  };

  const stats = {
    total: registers.length,
    checkedInToday: registers.filter(r => r.inTime?.startsWith(today)).length,
    checkedOutToday: registers.filter(r => r.outTime?.startsWith(today)).length,
    activeNow: registers.filter(r => r.inTime && !r.outTime).length,
  };

  // Color mapping for dark/light mode
  const colors = {
    bg: 'bg-white dark:bg-gray-950',
    cardBg: 'bg-white dark:bg-gray-900',
    cardBorder: 'border-amber-200 dark:border-gray-700',
    textPrimary: 'text-amber-900 dark:text-gray-50',
    textSecondary: 'text-amber-800 dark:text-gray-300',
    textTertiary: 'text-amber-600 dark:text-gray-400',
    buttonBorder: 'border-amber-300 dark:border-gray-600',
    buttonHover: 'hover:bg-amber-50 dark:hover:bg-gray-800',
    chartGrid: '#f0e7d5 dark:[#374151]',
    bar1: '#b45309',
    bar1Dark: '#6b7280',
    bar2: '#d97706',
    bar2Dark: '#9ca3af',
    tooltipBg: '#fef3c7',
    tooltipBgDark: '#1f2937',
    tooltipBorder: '#d97706',
    tooltipBorderDark: '#4b5563',
    tooltipText: '#92400e',
    tooltipTextDark: '#f3f4f6',
  };

  // Function to export chart data as CSV
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Check-Ins', 'Check-Outs'],
      ...chartData.map(item => [
        item.date,
        item['Check-Ins'],
        item['Check-Outs']
      ])
    ].map(e => e.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analytics-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${colors.bg} p-4`}>
      <Header />
      
      <div className="max-w-7xl mx-auto">
        <h2 className={`text-3xl font-bold ${colors.textPrimary} mb-8`}>Dashboard Analytics</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`border ${colors.cardBorder} ${colors.cardBg} shadow-sm`}>
            <CardHeader>
              <CardTitle className={colors.textSecondary}>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl font-bold ${colors.textPrimary}`}>{loading ? '...' : stats.total}</p>
            </CardContent>
          </Card>

          <Card className={`border ${colors.cardBorder} ${colors.cardBg} shadow-sm`}>
            <CardHeader>
              <CardTitle className={colors.textSecondary}>Active Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl font-bold ${colors.textPrimary}`}>{loading ? '...' : stats.checkedInToday}</p>
              <p className={`text-sm ${colors.textTertiary}`}>Checked in</p>
            </CardContent>
          </Card>

          <Card className={`border ${colors.cardBorder} ${colors.cardBg} shadow-sm`}>
            <CardHeader>
              <CardTitle className={colors.textSecondary}>Currently Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl font-bold ${colors.textPrimary}`}>{loading ? '...' : stats.activeNow}</p>
              <p className={`text-sm ${colors.textTertiary}`}>In the building</p>
            </CardContent>
          </Card>

          <Card className={`border ${colors.cardBorder} ${colors.cardBg} shadow-sm`}>
            <CardHeader>
              <CardTitle className={colors.textSecondary}>Checked Out</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl font-bold ${colors.textPrimary}`}>{loading ? '...' : stats.checkedOutToday}</p>
              <p className={`text-sm ${colors.textTertiary}`}>Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} p-6 rounded-lg shadow-sm mb-8`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-semibold ${colors.textPrimary}`}>Daily Check-Ins & Check-Outs</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className={`border ${colors.buttonBorder} ${colors.textSecondary} ${colors.buttonHover}`}
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickMargin={10}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-3 rounded-md border shadow-sm ${
                            document.documentElement.classList.contains('dark') 
                              ? `bg-[${colors.tooltipBgDark}] border-[${colors.tooltipBorderDark}] text-[${colors.tooltipTextDark}]`
                              : `bg-[${colors.tooltipBg}] border-[${colors.tooltipBorder}] text-[${colors.tooltipText}]`
                          }`}>
                            <p className="font-medium">
                              {new Date(label).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="flex items-center">
                              <span className="w-3 h-3 rounded-full bg-amber-700 mr-2"></span>
                              Check-Ins: <span className="font-semibold ml-1">{payload[0].value}</span>
                            </p>
                            <p className="flex items-center">
                              <span className="w-3 h-3 rounded-full bg-amber-600 mr-2"></span>
                              Check-Outs: <span className="font-semibold ml-1">{payload[1].value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Check-Ins" 
                    name="Check-Ins" 
                    fill={document.documentElement.classList.contains('dark') ? colors.bar1Dark : colors.bar1}
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Bar 
                    dataKey="Check-Outs" 
                    name="Check-Outs" 
                    fill={document.documentElement.classList.contains('dark') ? colors.bar2Dark : colors.bar2}
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className={colors.textTertiary}>
                  {loading ? 'Loading data...' : 'No chart data available'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}