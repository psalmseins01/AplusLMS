"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, BookOpen, Trophy, Target } from "lucide-react"

interface CourseAnalytics {
  courseId: string
  title: string
  totalEnrollments: number
  completionRate: number
  averageQuizScore: number
  totalQuizzes: number
  totalLessons: number
  averageTimeSpent: number
  lastActivity: string
}

interface OverallMetrics {
  totalStudents: number
  totalCourses: number
  totalCertificates: number
  averageCompletionRate: number
}

export default function EducatorAnalytics() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([])
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics>({
    totalStudents: 0,
    totalCourses: 0,
    totalCertificates: 0,
    averageCompletionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(currentUser)
    if (userData.role !== "educator") {
      router.push("/dashboard")
      return
    }

    setUser(userData)
    loadAnalytics(userData.email)
  }, [router])

  const loadAnalytics = (educatorEmail: string) => {
    try {
      // Load courses created by this educator
      const courses = JSON.parse(localStorage.getItem("courses") || "[]")
      const educatorCourses = courses.filter((course: any) => course.createdBy === educatorEmail)

      // Load enrollments
      const enrollments = JSON.parse(localStorage.getItem("enrollments") || "[]")

      // Load quiz attempts
      const quizAttempts = JSON.parse(localStorage.getItem("quizAttempts") || "[]")

      // Load certificates
      const certificates = JSON.parse(localStorage.getItem("certificates") || "[]")

      // Calculate analytics for each course
      const analytics: CourseAnalytics[] = educatorCourses.map((course: any) => {
        const courseEnrollments = enrollments.filter((e: any) => e.courseId === course.id)
        const courseQuizAttempts = quizAttempts.filter((qa: any) => qa.courseId === course.id)
        const courseCertificates = certificates.filter((c: any) => c.courseId === course.id)

        // Calculate completion rate
        const completionRate =
          courseEnrollments.length > 0 ? (courseCertificates.length / courseEnrollments.length) * 100 : 0

        // Calculate average quiz score
        const averageQuizScore =
          courseQuizAttempts.length > 0
            ? courseQuizAttempts.reduce((sum: number, qa: any) => sum + qa.score, 0) / courseQuizAttempts.length
            : 0

        // Get course content stats
        const modules = course.modules || []
        const totalLessons = modules.reduce((sum: number, module: any) => sum + (module.lessons?.length || 0), 0)
        const totalQuizzes = modules.reduce((sum: number, module: any) => sum + (module.quizzes?.length || 0), 0)

        return {
          courseId: course.id,
          title: course.title,
          totalEnrollments: courseEnrollments.length,
          completionRate: Math.round(completionRate),
          averageQuizScore: Math.round(averageQuizScore),
          totalQuizzes,
          totalLessons,
          averageTimeSpent: Math.floor(Math.random() * 120) + 30, // Mock data
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        }
      })

      setCourseAnalytics(analytics)

      // Calculate overall metrics
      const totalStudents = new Set(
        enrollments.filter((e: any) => educatorCourses.some((c: any) => c.id === e.courseId)).map((e: any) => e.userId),
      ).size

      const totalCertificates = certificates.filter((c: any) =>
        educatorCourses.some((course: any) => course.id === c.courseId),
      ).length

      const averageCompletionRate =
        analytics.length > 0 ? analytics.reduce((sum, a) => sum + a.completionRate, 0) / analytics.length : 0

      setOverallMetrics({
        totalStudents,
        totalCourses: educatorCourses.length,
        totalCertificates,
        averageCompletionRate: Math.round(averageCompletionRate),
      })
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your course performance and student engagement</p>
            </div>
            <Button onClick={() => router.push("/educator/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Published courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.totalCertificates}</div>
              <p className="text-xs text-muted-foreground">Course completions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.averageCompletionRate}%</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enrollment Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Enrollments</CardTitle>
                  <CardDescription>Number of students enrolled in each course</CardDescription>
                </CardHeader>
                <CardContent>
                  {courseAnalytics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={courseAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalEnrollments" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Completion Rate Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rates</CardTitle>
                  <CardDescription>Percentage of students completing each course</CardDescription>
                </CardHeader>
                <CardContent>
                  {courseAnalytics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={courseAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="completionRate" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance Details</CardTitle>
                <CardDescription>Detailed analytics for each of your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {courseAnalytics.length > 0 ? (
                  <div className="space-y-6">
                    {courseAnalytics.map((course, index) => (
                      <div key={course.courseId} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{course.title}</h3>
                            <p className="text-sm text-gray-600">Last activity: {course.lastActivity}</p>
                          </div>
                          <Badge
                            variant={
                              course.completionRate > 70
                                ? "default"
                                : course.completionRate > 40
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {course.completionRate}% completion
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{course.totalEnrollments}</div>
                            <div className="text-sm text-gray-600">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{course.averageQuizScore}%</div>
                            <div className="text-sm text-gray-600">Avg Quiz Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{course.totalLessons}</div>
                            <div className="text-sm text-gray-600">Lessons</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{course.averageTimeSpent}m</div>
                            <div className="text-sm text-gray-600">Avg Time</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Completion Progress</span>
                            <span>{course.completionRate}%</span>
                          </div>
                          <Progress value={course.completionRate} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-600 mb-4">Create your first course to see analytics here.</p>
                    <Button onClick={() => router.push("/educator/course/new")}>Create Course</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                  <CardDescription>Average quiz scores across courses</CardDescription>
                </CardHeader>
                <CardContent>
                  {courseAnalytics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={courseAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="averageQuizScore" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Content Overview</CardTitle>
                  <CardDescription>Distribution of lessons and quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  {courseAnalytics.length > 0 ? (
                    <div className="space-y-4">
                      {courseAnalytics.map((course, index) => (
                        <div key={course.courseId} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-600">
                              {course.totalLessons} lessons • {course.totalQuizzes} quizzes
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{course.totalEnrollments} students</div>
                            <div className="text-xs text-gray-600">{course.completionRate}% completion</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
