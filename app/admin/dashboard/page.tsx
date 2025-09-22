"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, BookOpen, Activity, Trash2, Search } from "lucide-react"

interface User {
  email: string
  name: string
  role: "learner" | "educator" | "admin"
  createdAt: string
  lastLogin?: string
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  createdBy: string
  createdAt: string
  enrollments: number
  isPublished: boolean
}

interface SystemMetrics {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  totalCertificates: number
  activeUsers: number
  publishedCourses: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
    activeUsers: 0,
    publishedCourses: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(currentUser)
    if (userData.role !== "admin") {
      router.push("/dashboard")
      return
    }

    setUser(userData)
    loadSystemData()
  }, [router])

  const loadSystemData = () => {
    try {
      // Load all users
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
      setUsers(allUsers)

      // Load all courses
      const allCourses = JSON.parse(localStorage.getItem("courses") || "[]")
      setCourses(allCourses)

      // Load enrollments and certificates
      const enrollments = JSON.parse(localStorage.getItem("enrollments") || "[]")
      const certificates = JSON.parse(localStorage.getItem("certificates") || "[]")

      // Calculate metrics
      const publishedCourses = allCourses.filter((c: Course) => c.isPublished !== false).length
      const activeUsers = allUsers.filter((u: User) => {
        const lastLogin = u.lastLogin ? new Date(u.lastLogin) : new Date(u.createdAt)
        const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceLogin <= 30 // Active if logged in within 30 days
      }).length

      setMetrics({
        totalUsers: allUsers.length,
        totalCourses: allCourses.length,
        totalEnrollments: enrollments.length,
        totalCertificates: certificates.length,
        activeUsers,
        publishedCourses,
      })
    } catch (error) {
      console.error("Error loading system data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (userEmail: string, newRole: string) => {
    const updatedUsers = users.map((u) =>
      u.email === userEmail ? { ...u, role: newRole as "learner" | "educator" | "admin" } : u,
    )
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Update current user if they changed their own role
    if (userEmail === user?.email) {
      const updatedCurrentUser = { ...user, role: newRole }
      setUser(updatedCurrentUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser))
    }
  }

  const handleDeleteUser = (userToDelete: User) => {
    setUserToDelete(userToDelete)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      const updatedUsers = users.filter((u) => u.email !== userToDelete.email)
      setUsers(updatedUsers)
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      // Also remove user's enrollments and other data
      const enrollments = JSON.parse(localStorage.getItem("enrollments") || "[]")
      const updatedEnrollments = enrollments.filter((e: any) => e.userId !== userToDelete.email)
      localStorage.setItem("enrollments", JSON.stringify(updatedEnrollments))

      setDeleteDialogOpen(false)
      setUserToDelete(null)
      loadSystemData() // Refresh metrics
    }
  }

  const toggleCourseStatus = (courseId: string) => {
    const updatedCourses = courses.map((c) => (c.id === courseId ? { ...c, isPublished: !c.isPublished } : c))
    setCourses(updatedCourses)
    localStorage.setItem("courses", JSON.stringify(updatedCourses))
    loadSystemData() // Refresh metrics
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">A+ LMS Admin</div>
              <nav className="hidden md:flex space-x-6">
                <a href="/admin/dashboard" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
                  Admin Dashboard
                </a>
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  My Dashboard
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
                <Badge className="bg-red-100 text-red-800">Admin</Badge>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600">Monitor and manage the learning platform</p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{metrics.activeUsers} active this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCourses}</div>
              <p className="text-xs text-muted-foreground">{metrics.publishedCourses} published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">{metrics.totalCertificates} certificates issued</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="analytics">System Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and roles</CardDescription>
                <div className="flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="learner">Learners</SelectItem>
                      <SelectItem value="educator">Educators</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.email} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            user.role === "admin"
                              ? "bg-red-600"
                              : user.role === "educator"
                                ? "bg-green-600"
                                : "bg-blue-600"
                          }`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-xs text-gray-500">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select value={user.role} onValueChange={(value) => handleRoleChange(user.email, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="learner">Learner</SelectItem>
                            <SelectItem value="educator">Educator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.email === user?.email} // Can't delete self
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Monitor and manage all courses on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={course.isPublished !== false ? "default" : "secondary"}>
                            {course.isPublished !== false ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">{course.category}</Badge>
                        </div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-gray-600 mb-1">{course.description}</div>
                        <div className="text-xs text-gray-500">
                          Created by {course.createdBy} • {course.enrollments} enrollments
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toggleCourseStatus(course.id)}>
                          {course.isPublished !== false ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["learner", "educator", "admin"].map((role) => {
                      const count = users.filter((u) => u.role === role).length
                      const percentage = users.length > 0 ? (count / users.length) * 100 : 0
                      return (
                        <div key={role} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                role === "admin" ? "bg-red-500" : role === "educator" ? "bg-green-500" : "bg-blue-500"
                              }`}
                            ></div>
                            <span className="capitalize">{role}s</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{count}</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Active Users (30 days)</span>
                      <span className="font-medium">
                        {metrics.activeUsers}/{metrics.totalUsers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Published Courses</span>
                      <span className="font-medium">
                        {metrics.publishedCourses}/{metrics.totalCourses}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completion Rate</span>
                      <span className="font-medium">
                        {metrics.totalEnrollments > 0
                          ? Math.round((metrics.totalCertificates / metrics.totalEnrollments) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This will remove all their data including
              enrollments and progress. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
