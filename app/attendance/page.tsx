"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Download,
  Search,
  Filter,
  Play,
  Square,
  Timer
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"

export default function AttendancePage() {
  const { user } = useAuth()
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [workDuration, setWorkDuration] = useState(0)
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    if (isClockedIn) {
      const workTimer = setInterval(() => {
        setWorkDuration(prev => prev + 1)
      }, 1000)
      return () => {
        clearInterval(timer)
        clearInterval(workTimer)
      }
    }
    return () => clearInterval(timer)
  }, [isClockedIn])

  useEffect(() => {
    // Load attendance records
    const mockRecords = generateMockRecords()
    setAttendanceRecords(mockRecords)
  }, [])

  const generateMockRecords = () => {
    const records = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const clockIn = new Date(date)
      clockIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))
      const clockOut = new Date(date)
      clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))
      
      const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
      
      records.push({
        id: `att-${i}`,
        date: date.toISOString(),
        clockIn: clockIn.toISOString(),
        clockOut: clockOut.toISOString(),
        hoursWorked: hoursWorked.toFixed(2),
        status: i < 2 ? 'pending' : i < 25 ? 'completed' : 'absent',
        location: ['Office', 'Remote', 'Office'][Math.floor(Math.random() * 3)],
        breakDuration: Math.floor(Math.random() * 60),
      })
    }
    return records.reverse()
  }

  const handleClockIn = async () => {
    setIsClockedIn(true)
    setWorkDuration(0)
    // In production, save to database
  }

  const handleClockOut = async () => {
    setIsClockedIn(false)
    // In production, save to database
    const newRecord = {
      id: `att-new-${Date.now()}`,
      date: new Date().toISOString(),
      clockIn: new Date(Date.now() - workDuration * 1000).toISOString(),
      clockOut: new Date().toISOString(),
      hoursWorked: (workDuration / 3600).toFixed(2),
      status: 'pending',
      location: 'Office',
      breakDuration: 30,
    }
    setAttendanceRecords(prev => [newRecord, ...prev])
    setWorkDuration(0)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const stats = {
    totalDays: attendanceRecords.length,
    presentDays: attendanceRecords.filter(r => r.status === 'completed').length,
    absentDays: attendanceRecords.filter(r => r.status === 'absent').length,
    totalHours: attendanceRecords.reduce((sum, r) => sum + parseFloat(r.hoursWorked || 0), 0).toFixed(1),
    avgHours: attendanceRecords.length > 0 
      ? (attendanceRecords.reduce((sum, r) => sum + parseFloat(r.hoursWorked || 0), 0) / attendanceRecords.length).toFixed(1)
      : 0,
    attendanceRate: attendanceRecords.length > 0
      ? ((attendanceRecords.filter(r => r.status === 'completed').length / attendanceRecords.length) * 100).toFixed(1)
      : 0
  }

  const filteredRecords = attendanceRecords.filter(r => {
    if (searchTerm && !format(new Date(r.date), 'PPP').toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (filterMonth && !r.date.startsWith(filterMonth)) {
      return false
    }
    return true
  })

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Clock className="h-8 w-8 text-accent" />
                Time Tracking & Attendance
              </h1>
              <p className="text-muted-foreground">
                Track your work hours and attendance
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Timesheet
            </Button>
          </div>

          {/* Clock In/Out Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-4 rounded-lg bg-accent/10">
                      <Timer className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Time</p>
                      <p className="text-3xl font-bold text-foreground">
                        {format(currentTime, 'HH:mm:ss')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(currentTime, 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {isClockedIn && (
                    <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            Currently Clocked In
                          </p>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                            {formatDuration(workDuration)}
                          </p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {!isClockedIn ? (
                    <Button 
                      onClick={handleClockIn} 
                      size="lg" 
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-5 w-5" />
                      Clock In
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleClockOut} 
                      size="lg" 
                      variant="destructive"
                      className="gap-2"
                    >
                      <Square className="h-5 w-5" />
                      Clock Out
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="mb-6 grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Present Days</p>
                    <p className="text-2xl font-bold text-green-600">{stats.presentDays}</p>
                    <p className="text-xs text-muted-foreground">of {stats.totalDays} days</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Absent Days</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absentDays}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">{stats.totalHours}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Hours/Day</p>
                    <p className="text-2xl font-bold">{stats.avgHours}h</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.attendanceRate}%</p>
                  </div>
                  <Calendar className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search dates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records ({filteredRecords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Clock In</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Clock Out</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Hours</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-border/50 hover:bg-accent/5">
                        <td className="py-4 px-4">
                          <div className="font-medium">
                            {format(new Date(record.date), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(record.date), 'EEEE')}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {record.clockIn ? format(new Date(record.clockIn), 'HH:mm') : '-'}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {record.clockOut ? format(new Date(record.clockOut), 'HH:mm') : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">{record.hoursWorked}h</span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{record.location}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            className={
                              record.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : record.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }
                          >
                            {record.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRecords.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No attendance records found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
