"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { Workshop } from "../../types/workshop"


export default function WorkshopsPage() {
  const [currentDate, setCurrentDate] = useState(new Date()) 
  const [workshops, setWorkshops] = useState<Workshop[]>([])

  useEffect(() => {
      const fetchData = async() => {
        const res = await fetch('/api/workshops')
        const data: Workshop[] = await res.json()
        setWorkshops(data)
      }
      fetchData()
    }, [])

  
  // カレンダー関係
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
  }

  const getWorkshopsForDate = (date: string) => {
    return workshops.filter((workshop) => workshop.date === date)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // 空のセルを追加（月の最初の日まで）
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // 日付のセルを追加
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayWorkshops = getWorkshopsForDate(dateString)
      const todayString = new Date().toISOString().split("T")[0]
     const isToday = dateString === todayString

      days.push(
        <Popover key={day}>
          <PopoverTrigger>
            <div className={`h-24 border border-gray-200 p-1 ${isToday ? "bg-red-50" : "bg-white"}`}>
              <div className={`text-sm font-medium mb-1 ${isToday ? "text-red-500" : "text-gray-900"}`}>{day}</div>
              <div className="space-y-1">
                {dayWorkshops.slice(0, 2).map((workshop) => (
                  <div
                    key={workshop.id}
                    className="bg-red-100 text-red-700 text-xs px-1 py-0.5 rounded truncate"
                    title={workshop.title}
                  >
                    ・{workshop.title}
                  </div>
                ))}
                {dayWorkshops.length > 2 && <div className="text-xs text-gray-500">+{dayWorkshops.length - 2}件</div>}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 z-50">
            {dayWorkshops.length > 0 ? (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {dayWorkshops.map((workshop) => (
                  <li key={workshop.id} className="border-b pb-1">
                    <p className="font-semibold">{workshop.title}</p>
                    <p className="text-sm text-gray-600">
                      {workshop.time} ({workshop.duration}分)
                    </p>
                    <p className="text-sm text-gray-500">{workshop.location}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">この日のイベントはありません。</p>
            )}
          </PopoverContent>
        </Popover>
      )
    }

    return days
  }

  const upcomingWorkshops = workshops
    .filter((workshop) => {
      const today = new Date()
      const target = new Date(workshop.date)

      // 同じ日付なら true になるように、0時基準の比較
      return target.getTime() >= new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ホームに戻る
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-black" />
                <h1 className="text-2xl font-bold text-gray-900">ワークショップ</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-50">
            <TabsTrigger value="list">リスト表示</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
          </TabsList>

          {/* カレンダー表示 */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{formatDate(currentDate)}</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                    <div key={day} className="p-3 text-center font-medium text-gray-700 bg-gray-50">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">{renderCalendar()}</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/** リスト表示 */}        
          <TabsContent value="list" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">今後のワークショップ</h2>
              <Badge variant="outline">{upcomingWorkshops.length}件</Badge>
            </div>

            <div className="grid gap-6">
              {upcomingWorkshops.map((workshop) => (
                <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{workshop.title}</CardTitle>
                        <CardDescription className="text-base mt-1">講師: {workshop.instructor}</CardDescription>
                      </div>
                      <Badge variant={workshop.difficulty === "初心者向け" ? "default" : "secondary"}>
                        {workshop.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{workshop.description}</p>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(workshop.date).toLocaleDateString("ja-JP")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            {workshop.time} ({workshop.duration}分)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{workshop.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">持参物:</span> {workshop.materials}
                      </div>
                      <div>
                        <span className="font-medium">注意事項:</span> {workshop.requirements}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
