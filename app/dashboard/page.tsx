"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award, Download } from "lucide-react"

interface User {
  email: string
  role: string
  name: string
}

interface Certificate {
  id: string
  courseId: string
  courseTitle: string
  educatorName: string
  completionDate: string
  certificateUrl: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [activeTab, setActiveTab] = useState<"courses" | "certificates">("courses")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    if (parsedUser.role === "learner") {
      loadEnrolledCourses(parsedUser.email)
      loadCertificates(parsedUser.email)
    }
  }, [router])

  const loadEnrolledCourses = (userEmail: string) => {
    const enrollmentIds = JSON.parse(localStorage.getItem(`enrollments_${userEmail}`) || "[]")

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const educators = allUsers.filter((u: any) => u.role === "educator")

    const enrolledCoursesData: any[] = []
    educators.forEach((educator: User) => {
      const educatorCourses = JSON.parse(localStorage.getItem(`courses_${educator.email}`) || "[]")
      educatorCourses.forEach((course: any) => {
        if (enrollmentIds.includes(course.id)) {
          const progressData = JSON.parse(localStorage.getItem(`progress_${userEmail}_${course.id}`) || "{}")
          const actualProgress = progressData.overallProgress || Math.floor(Math.random() * 30) + 5
          const validProgress = isNaN(actualProgress) ? 0 : Math.min(Math.max(actualProgress, 0), 100)

          enrolledCoursesData.push({
            ...course,
            educatorName: educator.name,
            progress: validProgress,
          })
        }
      })
    })

    setEnrolledCourses(enrolledCoursesData)
  }

  const loadCertificates = (userEmail: string) => {
    try {
      const userCertificates = JSON.parse(localStorage.getItem(`certificates_${userEmail}`) || "[]")
      setCertificates(Array.isArray(userCertificates) ? userCertificates : [])
    } catch (error) {
      console.error("Error loading certificates:", error)
      setCertificates([])
    }
  }

  const downloadCertificate = (certificate: Certificate) => {
    const link = document.createElement("a")
    link.href = certificate.certificateUrl
    link.download = `${certificate.courseTitle}_Certificate.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "educator":
        return "bg-green-100 text-green-800"
      case "learner":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">A+ LMS</div>
              <nav className="hidden md:flex space-x-6">
                <a href="/dashboard" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
                  My Learning
                </a>
                <Link href="/courses" className="text-gray-700 hover:text-blue-600 font-medium">
                  Explore
                </Link>
                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                  Online Degrees
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                  Careers
                </a>
                {user?.role === "educator" && (
                  <Link href="/educator/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                    My Courses
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
                <Badge className={getRoleColor(user?.role || "")}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Guest"}
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}, {user?.name}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-blue-600">🤖</span>
              <p className="text-gray-600">
                Need help? Tell me a little about yourself so I can make the best recommendations.
              </p>
              <Button variant="link" className="text-blue-600 p-0 h-auto">
                Set your goal
              </Button>
            </div>
          </div>
        </div>

        {user?.role === "educator" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Educator Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Link href="/educator/dashboard">
                  <Button>Manage Courses</Button>
                </Link>
                <Link href="/educator/course/new">
                  <Button variant="outline">Create New Course</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Today's goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm">Complete any 3 learning items • 0/3</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm">Watch a video</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm">Complete a module</span>
                </div>
              </CardContent>
            </Card>

            {/* Certificates Summary Card */}
            {user?.role === "learner" && Array.isArray(certificates) && certificates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Array.isArray(certificates) ? certificates.length : 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Certificate{certificates.length !== 1 ? "s" : ""} Earned
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => setActiveTab("certificates")}
                    >
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Learning Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Learning plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
                  <div className="font-medium">T</div>
                  <div className="font-medium">W</div>
                  <div className="font-medium">T</div>
                  <div className="font-medium">F</div>
                  <div className="font-medium">S</div>
                  <div className="font-medium">S</div>
                  <div className="font-medium">✏️</div>
                </div>
                <div className="text-center">
                  <p className="font-semibold">August 2025</p>
                  <div className="grid grid-cols-7 gap-1 mt-2 text-xs">
                    {Array.from({ length: 31 }, (_, i) => (
                      <div key={i} className="p-1">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            {user?.role === "learner" && (
              <div className="flex space-x-4">
                <Button
                  variant={activeTab === "courses" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("courses")}
                >
                  My Courses
                </Button>
                <Button
                  variant={activeTab === "certificates" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("certificates")}
                >
                  Certificates ({Array.isArray(certificates) ? certificates.length : 0})
                </Button>
              </div>
            )}

            {/* Conditional Content Based on Active Tab */}
            {activeTab === "courses" && (
              <>
                {/* Filter Tabs */}
                <div className="flex space-x-4">
                  <Button variant="default" size="sm">
                    In Progress
                  </Button>
                  <Button variant="outline" size="sm">
                    Completed
                  </Button>
                </div>

                {/* Course Cards */}
                <div className="space-y-4">
                  {user?.role === "learner" && enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => (
                      <Card key={course.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-blue-600 text-sm font-medium">{course.educatorName}</span>
                                {course.progress === 100 && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Award className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Course • {isNaN(course.progress) ? "0" : course.progress.toString()}% complete •
                                Estimated completion:{" "}
                                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                              </p>
                              <Progress value={isNaN(course.progress) ? 0 : course.progress} className="mb-4" />
                            </div>
                            <div className="ml-6">
                              <div className="text-right mb-2">
                                <h4 className="font-semibold">
                                  {course.progress === 100 ? "Course Completed!" : "Continue Learning"}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {course.progress === 100 ? "🏆 Certificate Available" : "📹 Next: Course Content"}
                                </p>
                              </div>
                              <Link href={`/courses/${course.id}`}>
                                <Button>{course.progress === 100 ? "View Certificate" : "Resume"}</Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : user?.role === "learner" ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
                        <p className="text-gray-600 mb-4">Start learning by exploring our course catalog</p>
                        <Link href="/courses">
                          <Button>Explore Courses</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-blue-600 text-sm font-medium">Duke University</span>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">
                                Introduction to Programming and Animation with Alice
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Course • 7% complete • Estimated completion: Oct 13, 2025
                              </p>
                              <Progress value={7} className="mb-4" />
                            </div>
                            <div className="ml-6">
                              <div className="text-right mb-2">
                                <h4 className="font-semibold">Arrays Demo with Jumping Jacks</h4>
                                <p className="text-sm text-gray-600">📹 Video (10 minutes)</p>
                              </div>
                              <Link href="/courses/1">
                                <Button>Resume</Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-blue-600 text-sm font-medium">Coursera Project Network</span>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">Develop a Company Website with Wix</h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Course • 14% complete • Estimated completion: Aug 20, 2025
                              </p>
                              <Progress value={14} className="mb-4" />
                            </div>
                            <div className="ml-6">
                              <div className="text-right mb-2">
                                <h4 className="font-semibold">Graded Quiz: Test your Project understanding</h4>
                                <p className="text-sm text-gray-600">📝 Graded Assignment (30 minutes)</p>
                              </div>
                              <Link href="/courses/2">
                                <Button>Resume</Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Certificates Tab Content */}
            {activeTab === "certificates" && user?.role === "learner" && (
              <div className="space-y-4">
                {Array.isArray(certificates) && certificates.length > 0 ? (
                  certificates.map((certificate) => (
                    <Card key={certificate.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{certificate.courseTitle}</h3>
                              <p className="text-sm text-gray-600">Instructor: {certificate.educatorName}</p>
                              <p className="text-sm text-gray-500">
                                Completed on {new Date(certificate.completionDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link href={`/courses/${certificate.courseId}?tab=certificate`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Button size="sm" onClick={() => downloadCertificate(certificate)}>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                      <p className="text-gray-600 mb-4">Complete courses to earn certificates</p>
                      <Button onClick={() => setActiveTab("courses")}>View My Courses</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
