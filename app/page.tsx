import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">A+ LMS</div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link href="/courses" className="text-gray-700 hover:text-blue-600 font-medium">
                Courses
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to A+ Computer Training
            <span className="text-blue-600 block">Learning Management Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empower your learning journey with our comprehensive platform designed for modern education. Access courses,
            track progress, and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Learning Today
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">📚</span>
                </div>
                Course Catalog
              </CardTitle>
              <CardDescription>Access a wide range of courses designed by expert educators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Browse through our comprehensive course library covering various topics from basic computer skills to
                advanced programming.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">📊</span>
                </div>
                Progress Tracking
              </CardTitle>
              <CardDescription>Monitor your learning progress and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Keep track of your course completion, quiz scores, and overall learning progress with detailed
                analytics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">🏆</span>
                </div>
                Certificates
              </CardTitle>
              <CardDescription>Earn certificates upon course completion</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive official certificates for completed courses to showcase your new skills and knowledge.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role-based Access Info */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Role</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Learner</h3>
              <p className="text-gray-600">Access courses, complete lessons, take quizzes, and track your progress</p>
            </div>
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Educator</h3>
              <p className="text-gray-600">
                Create courses, manage content, design quizzes, and monitor student progress
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin</h3>
              <p className="text-gray-600">
                Manage users, oversee platform operations, and access comprehensive analytics
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
