"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"

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
}

const categories = [
  "Programming",
  "Web Development",
  "Data Science",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Language",
  "Other",
]

export default function EditCoursePage() {
  const [user, setUser] = useState<User | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "educator") {
      router.push("/dashboard")
      return
    }

    setUser(parsedUser)
    loadCourse(parsedUser.email, params.id as string)
  }, [router, params.id])

  const loadCourse = (educatorEmail: string, courseId: string) => {
    const storedCourses = localStorage.getItem(`courses_${educatorEmail}`)
    if (storedCourses) {
      const courses = JSON.parse(storedCourses)
      const foundCourse = courses.find((c: Course) => c.id === courseId)
      if (foundCourse) {
        setCourse(foundCourse)
        setTitle(foundCourse.title)
        setDescription(foundCourse.description)
        setCategory(foundCourse.category)
      } else {
        router.push("/educator/dashboard")
      }
    } else {
      router.push("/educator/dashboard")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!title.trim() || !description.trim() || !category) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      if (user && course) {
        // Get existing courses
        const existingCourses = localStorage.getItem(`courses_${user.email}`)
        const courses = existingCourses ? JSON.parse(existingCourses) : []

        // Update course
        const updatedCourses = courses.map((c: Course) =>
          c.id === course.id ? { ...c, title: title.trim(), description: description.trim(), category } : c,
        )

        localStorage.setItem(`courses_${user.email}`, JSON.stringify(updatedCourses))
        router.push("/educator/dashboard")
      }
    } catch (err) {
      setError("Failed to update course. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user || !course) {
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
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/educator/dashboard">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter course title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-sm text-gray-500">{title.length}/100 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this course"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  required
                />
                <p className="text-sm text-gray-500">{description.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/educator/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Course"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
