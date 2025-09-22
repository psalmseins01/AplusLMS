"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Users } from "lucide-react"

interface User {
  email: string
  role: string
  name: string
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  createdAt: string
  enrollments: number
  educatorEmail: string
  educatorName: string
}

export default function CourseCatalogPage() {
  const [user, setUser] = useState<User | null>(null)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    loadAllCourses()
    loadEnrollments(parsedUser.email)
  }, [router])

  const loadAllCourses = () => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const educators = allUsers.filter((u: User) => u.role === "educator")

    const courses: Course[] = []
    educators.forEach((educator: User) => {
      const educatorCourses = JSON.parse(localStorage.getItem(`courses_${educator.email}`) || "[]")
      educatorCourses.forEach((course: any) => {
        courses.push({
          ...course,
          educatorEmail: educator.email,
          educatorName: educator.name,
        })
      })
    })

    setAllCourses(courses)
    setFilteredCourses(courses)
  }

  const loadEnrollments = (userEmail: string) => {
    const enrollments = JSON.parse(localStorage.getItem(`enrollments_${userEmail}`) || "[]")
    setEnrolledCourses(enrollments)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredCourses(allCourses)
      return
    }

    const filtered = allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.educatorName.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredCourses(filtered)
  }

  const handleEnroll = (courseId: string) => {
    if (!user) return

    const newEnrollments = [...enrolledCourses, courseId]
    setEnrolledCourses(newEnrollments)
    localStorage.setItem(`enrollments_${user.email}`, JSON.stringify(newEnrollments))

    // Update course enrollment count
    const updatedCourses = allCourses.map((course) => {
      if (course.id === courseId) {
        const updatedCourse = { ...course, enrollments: course.enrollments + 1 }
        // Update in educator's course list
        const educatorCourses = JSON.parse(localStorage.getItem(`courses_${course.educatorEmail}`) || "[]")
        const updatedEducatorCourses = educatorCourses.map((c: any) =>
          c.id === courseId ? { ...c, enrollments: c.enrollments + 1 } : c,
        )
        localStorage.setItem(`courses_${course.educatorEmail}`, JSON.stringify(updatedEducatorCourses))
        return updatedCourse
      }
      return course
    })

    setAllCourses(updatedCourses)
    setFilteredCourses(
      updatedCourses.filter(
        (course) =>
          !searchQuery.trim() ||
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.educatorName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    )
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) {
    return <div>Loading...</div>
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
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  My Learning
                </Link>
                <a href="/courses" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
                  Explore
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                  Online Degrees
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                  Careers
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name}</span>
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
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Courses</h1>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No courses found" : "No courses available"}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? `No courses match "${searchQuery}". Try a different search term.`
                : "Check back later for new courses."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    <span className="text-sm text-gray-500">{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <p className="text-sm text-blue-600 font-medium">{course.educatorName}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{course.enrollments} enrolled</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link href={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          View Course
                        </Button>
                      </Link>

                      {user.role === "learner" &&
                        (enrolledCourses.includes(course.id) ? (
                          <Badge className="bg-green-100 text-green-800">Enrolled</Badge>
                        ) : (
                          <Button onClick={() => handleEnroll(course.id)} size="sm">
                            Enroll
                          </Button>
                        ))}

                      {user.role === "educator" && course.educatorEmail === user.email && (
                        <Badge className="bg-green-100 text-green-800">Your Course</Badge>
                      )}

                      {user.role === "admin" && <Badge className="bg-purple-100 text-purple-800">Admin View</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
