"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, PlayCircle, FileText, Clock, Award } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  timeLimit?: number
  maxAttempts?: number
}

interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string
  pdfUrl?: string
  completed?: boolean
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  quiz?: Quiz
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  instructor: string
  modules: Module[]
}

interface QuizAttempt {
  quizId: string
  answers: number[]
  score: number
  completedAt: string
  timeSpent: number
}

interface ProgressData {
  [key: string]: {
    completed: boolean
    completedAt?: string
    timeSpent?: number
    score?: number
  }
}

interface DetailedProgress {
  totalItems: number
  completedItems: number
  lessonsCompleted: number
  quizzesCompleted: number
  totalLessons: number
  totalQuizzes: number
  completionPercentage: number
  lastActivity?: string
}

interface Certificate {
  id: string
  courseId: string
  courseName: string
  learnerName: string
  instructorName: string
  completionDate: string
  certificateUrl?: string
}

interface User {
  email: string
  role: string
  name: string
}

export default function CourseViewPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [quizAttempt, setQuizAttempt] = useState<{
    quizId: string
    answers: number[]
    startTime: number
    timeRemaining?: number
  } | null>(null)
  const [quizResults, setQuizResults] = useState<QuizAttempt | null>(null)
  const [progress, setProgress] = useState<ProgressData>({})
  const [detailedProgress, setDetailedProgress] = useState<DetailedProgress | null>(null)
  const [certificate, setCertificate] = useState<Certificate | null>(null)

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load course data
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const educators = allUsers.filter((u: any) => u.role === "educator")

    let foundCourse = null
    educators.forEach((educator: User) => {
      const educatorCourses = JSON.parse(localStorage.getItem(`courses_${educator.email}`) || "[]")
      const course = educatorCourses.find((c: any) => c.id === courseId)
      if (course) {
        foundCourse = {
          ...course,
          instructor: educator.name,
          modules: course.modules || [], // Ensure modules exist
        }
      }
    })

    if (!foundCourse) {
      foundCourse = {
        id: courseId,
        title: "Introduction to Programming and Animation with Alice",
        description: "Learn the fundamentals of programming through interactive animations and visual storytelling.",
        category: "Computer Science",
        instructor: "Duke University",
        modules: [
          {
            id: "module1",
            title: "Getting Started with Alice",
            description: "Introduction to the Alice programming environment",
            lessons: [
              {
                id: "lesson1",
                title: "Welcome to Alice",
                content:
                  "Alice is a 3D programming environment that makes it easy to create animations for telling stories, playing interactive games, or sharing videos on the web. Alice is a teaching tool for introductory computing.",
                videoUrl: "https://example.com/alice-intro.mp4",
              },
              {
                id: "lesson2",
                title: "Your First Animation",
                content:
                  "In this lesson, you'll create your first simple animation using Alice's drag-and-drop interface.",
                pdfUrl: "https://example.com/alice-tutorial.pdf",
              },
            ],
            quiz: {
              id: "quiz1",
              title: "Alice Basics Quiz",
              description: "Test your understanding of Alice fundamentals",
              questions: [
                {
                  id: "q1",
                  question: "What is Alice primarily used for?",
                  options: [
                    "Web development",
                    "3D animations and programming education",
                    "Database management",
                    "Mobile app development",
                  ],
                  correctAnswer: 1,
                  explanation: "Alice is designed specifically for teaching programming through 3D animations.",
                },
                {
                  id: "q2",
                  question: "Alice uses which type of programming interface?",
                  options: ["Text-based coding", "Drag-and-drop blocks", "Voice commands", "Gesture controls"],
                  correctAnswer: 1,
                  explanation: "Alice uses a visual, drag-and-drop interface to make programming more accessible.",
                },
              ],
              timeLimit: 10,
              maxAttempts: 3,
            },
          },
        ],
      }
    }

    setCourse(foundCourse)

    const progressData = JSON.parse(localStorage.getItem(`progress_${parsedUser.email}_${courseId}`) || "{}")
    setProgress(progressData)

    if (foundCourse) {
      calculateDetailedProgress(foundCourse, progressData)
      checkForCertificate(foundCourse, parsedUser)
    }
  }, [courseId, router])

  const calculateDetailedProgress = (course: Course, progressData: ProgressData) => {
    let totalLessons = 0
    let totalQuizzes = 0
    let lessonsCompleted = 0
    let quizzesCompleted = 0
    let lastActivity: string | undefined

    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        totalLessons++
        const key = `${module.id}_${lesson.id}`
        if (progressData[key]?.completed) {
          lessonsCompleted++
          if (progressData[key].completedAt && (!lastActivity || progressData[key].completedAt! > lastActivity)) {
            lastActivity = progressData[key].completedAt
          }
        }
      })

      if (module.quiz) {
        totalQuizzes++
        const key = `quiz_${module.quiz.id}`
        if (progressData[key]?.completed) {
          quizzesCompleted++
          if (progressData[key].completedAt && (!lastActivity || progressData[key].completedAt! > lastActivity)) {
            lastActivity = progressData[key].completedAt
          }
        }
      }
    })

    const totalItems = totalLessons + totalQuizzes
    const completedItems = lessonsCompleted + quizzesCompleted
    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    setDetailedProgress({
      totalItems,
      completedItems,
      lessonsCompleted,
      quizzesCompleted,
      totalLessons,
      totalQuizzes,
      completionPercentage,
      lastActivity,
    })
  }

  const checkForCertificate = (course: Course, user: any) => {
    const certificates = JSON.parse(localStorage.getItem(`certificates_${user.email}`) || "[]")
    const existingCert = certificates.find((cert: Certificate) => cert.courseId === course.id)
    if (existingCert) {
      setCertificate(existingCert)
    }
  }

  const markLessonComplete = (moduleId: string, lessonId: string) => {
    const key = `${moduleId}_${lessonId}`
    const completedAt = new Date().toISOString()

    const newProgress = {
      ...progress,
      [key]: {
        completed: true,
        completedAt,
        timeSpent: Math.floor(Math.random() * 300) + 60, // Mock time spent in seconds
      },
    }

    setProgress(newProgress)
    localStorage.setItem(`progress_${user.email}_${courseId}`, JSON.stringify(newProgress))

    if (course) {
      calculateDetailedProgress(course, newProgress)
    }
  }

  const startQuiz = (quiz: Quiz) => {
    const attempts = JSON.parse(localStorage.getItem(`quiz_attempts_${user.email}_${quiz.id}`) || "[]")

    if (quiz.maxAttempts && attempts.length >= quiz.maxAttempts) {
      alert(`You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz.`)
      return
    }

    setQuizAttempt({
      quizId: quiz.id,
      answers: new Array(quiz.questions.length).fill(-1),
      startTime: Date.now(),
      timeRemaining: quiz.timeLimit ? quiz.timeLimit * 60 : undefined,
    })
    setQuizResults(null)
  }

  const submitQuiz = (quiz: Quiz) => {
    if (!quizAttempt) return

    const timeSpent = Math.floor((Date.now() - quizAttempt.startTime) / 1000)
    let score = 0

    quiz.questions.forEach((question, index) => {
      if (quizAttempt.answers[index] === question.correctAnswer) {
        score++
      }
    })

    const percentage = Math.round((score / quiz.questions.length) * 100)
    const completedAt = new Date().toISOString()

    const attempt: QuizAttempt = {
      quizId: quiz.id,
      answers: quizAttempt.answers,
      score: percentage,
      completedAt,
      timeSpent,
    }

    // Save attempt
    const attempts = JSON.parse(localStorage.getItem(`quiz_attempts_${user.email}_${quiz.id}`) || "[]")
    attempts.push(attempt)
    localStorage.setItem(`quiz_attempts_${user.email}_${quiz.id}`, JSON.stringify(attempts))

    const key = `quiz_${quiz.id}`
    const newProgress = {
      ...progress,
      [key]: {
        completed: true,
        completedAt,
        timeSpent,
        score: percentage,
      },
    }

    setProgress(newProgress)
    localStorage.setItem(`progress_${user.email}_${courseId}`, JSON.stringify(newProgress))

    if (course) {
      calculateDetailedProgress(course, newProgress)
    }

    setQuizResults(attempt)
    setQuizAttempt(null)
  }

  const updateQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (!quizAttempt) return

    const newAnswers = [...quizAttempt.answers]
    newAnswers[questionIndex] = answerIndex
    setQuizAttempt({ ...quizAttempt, answers: newAnswers })
  }

  const calculateCourseProgress = () => {
    return detailedProgress?.completionPercentage || 0
  }

  const generateCertificate = async () => {
    if (!course || !user || calculateCourseProgress() !== 100) return

    const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const completionDate = new Date().toISOString()

    const newCertificate: Certificate = {
      id: certificateId,
      courseId: course.id,
      courseName: course.title,
      learnerName: user.name,
      instructorName: course.instructor,
      completionDate,
    }

    const certificates = JSON.parse(localStorage.getItem(`certificates_${user.email}`) || "[]")
    certificates.push(newCertificate)
    localStorage.setItem(`certificates_${user.email}`, JSON.stringify(certificates))

    setCertificate(newCertificate)

    await generatePDFCertificate(newCertificate)
  }

  const generatePDFCertificate = async (cert: Certificate) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 8
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

    // Inner border
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

    // Title
    ctx.fillStyle = "#1e40af"
    ctx.font = "bold 48px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Certificate of Completion", canvas.width / 2, 120)

    // Subtitle
    ctx.fillStyle = "#374151"
    ctx.font = "24px Arial"
    ctx.fillText("This is to certify that", canvas.width / 2, 180)

    // Learner name
    ctx.fillStyle = "#1e40af"
    ctx.font = "bold 36px Arial"
    ctx.fillText(cert.learnerName, canvas.width / 2, 240)

    // Course completion text
    ctx.fillStyle = "#374151"
    ctx.font = "24px Arial"
    ctx.fillText("has successfully completed the course", canvas.width / 2, 300)

    // Course name
    ctx.fillStyle = "#1e40af"
    ctx.font = "bold 32px Arial"
    ctx.fillText(cert.courseName, canvas.width / 2, 360)

    // Instructor
    ctx.fillStyle = "#374151"
    ctx.font = "20px Arial"
    ctx.fillText(`Instructor: ${cert.instructorName}`, canvas.width / 2, 420)

    // Date
    ctx.fillText(`Date: ${new Date(cert.completionDate).toLocaleDateString()}`, canvas.width / 2, 460)

    // Certificate ID
    ctx.fillStyle = "#6b7280"
    ctx.font = "14px Arial"
    ctx.fillText(`Certificate ID: ${cert.id}`, canvas.width / 2, 520)

    // Convert to blob and create download URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const updatedCert = { ...cert, certificateUrl: url }
        setCertificate(updatedCert)

        // Update stored certificate with URL
        const certificates = JSON.parse(localStorage.getItem(`certificates_${user.email}`) || "[]")
        const certIndex = certificates.findIndex((c: Certificate) => c.id === cert.id)
        if (certIndex !== -1) {
          certificates[certIndex] = updatedCert
          localStorage.setItem(`certificates_${user.email}`, JSON.stringify(certificates))
        }
      }
    }, "image/png")
  }

  const downloadCertificate = () => {
    if (!certificate?.certificateUrl) return

    const link = document.createElement("a")
    link.href = certificate.certificateUrl
    link.download = `${certificate.courseName.replace(/[^a-z0-9]/gi, "_")}_Certificate.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!course || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary">{course.category}</Badge>
                <span className="text-sm text-gray-500">Instructor: {course.instructor}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-2">Course Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={calculateCourseProgress()} className="w-32" />
                <span className="text-sm font-medium">{calculateCourseProgress()}%</span>
              </div>
              {detailedProgress && (
                <div className="text-xs text-gray-500 mt-1">
                  {detailedProgress.completedItems} of {detailedProgress.totalItems} items completed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Course Content</TabsTrigger>
            {calculateCourseProgress() === 100 && <TabsTrigger value="certificate">Certificate</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Course Structure</h4>
                        <p className="text-sm text-gray-600">{course.modules.length} modules</p>
                        <p className="text-sm text-gray-600">{detailedProgress?.totalLessons || 0} lessons</p>
                        <p className="text-sm text-gray-600">{detailedProgress?.totalQuizzes || 0} quizzes</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Your Progress</h4>
                        <p className="text-sm text-gray-600">{calculateCourseProgress()}% complete</p>
                        {detailedProgress && (
                          <>
                            <p className="text-sm text-gray-600">
                              Lessons: {detailedProgress.lessonsCompleted}/{detailedProgress.totalLessons}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quizzes: {detailedProgress.quizzesCompleted}/{detailedProgress.totalQuizzes}
                            </p>
                            {detailedProgress.lastActivity && (
                              <p className="text-xs text-gray-500 mt-2">
                                Last activity: {new Date(detailedProgress.lastActivity).toLocaleDateString()}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={() => setActiveTab("content")} className="w-full">
                      Start Learning
                    </Button>
                    {calculateCourseProgress() === 100 && (
                      <>
                        {!certificate ? (
                          <Button
                            onClick={generateCertificate}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Generate Certificate
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <Button
                              onClick={() => setActiveTab("certificate")}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Award className="w-4 h-4 mr-2" />
                              View Certificate
                            </Button>
                            {certificate.certificateUrl && (
                              <Button
                                onClick={downloadCertificate}
                                variant="outline"
                                className="w-full border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                              >
                                Download Certificate
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {calculateCourseProgress() < 100 && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Award className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-blue-700 font-medium">Complete course to earn certificate</p>
                        <p className="text-xs text-blue-600 mt-1">{100 - calculateCourseProgress()}% remaining</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Module Navigation */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Course Modules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {course.modules.map((module) => (
                      <div key={module.id}>
                        <Button
                          variant={selectedModule === module.id ? "default" : "ghost"}
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => {
                            setSelectedModule(module.id)
                            setSelectedLesson(null)
                          }}
                        >
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {module.lessons.length} lessons
                              {module.quiz && " + 1 quiz"}
                            </div>
                          </div>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                {!selectedModule ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <h3 className="text-lg font-medium mb-2">Select a module to begin</h3>
                      <p className="text-gray-600">Choose a module from the left to start learning</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Module Overview */}
                    {!selectedLesson && !quizAttempt && (
                      <Card>
                        <CardHeader>
                          <CardTitle>{course.modules.find((m) => m.id === selectedModule)?.title}</CardTitle>
                          <CardDescription>
                            {course.modules.find((m) => m.id === selectedModule)?.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <h4 className="font-medium">Lessons in this module:</h4>
                            {course.modules
                              .find((m) => m.id === selectedModule)
                              ?.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    {progress[`${selectedModule}_${lesson.id}`] ? (
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <PlayCircle className="w-5 h-5 text-gray-400" />
                                    )}
                                    <div>
                                      <h5 className="font-medium">{lesson.title}</h5>
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        {lesson.videoUrl && <span>Video</span>}
                                        {lesson.pdfUrl && <span>PDF</span>}
                                        <span>Text Content</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedLesson(lesson.id)}>
                                    {progress[`${selectedModule}_${lesson.id}`] ? "Review" : "Start"}
                                  </Button>
                                </div>
                              ))}

                            {/* Quiz Section */}
                            {course.modules.find((m) => m.id === selectedModule)?.quiz && (
                              <div className="border-t pt-4">
                                <h4 className="font-medium mb-3">Module Quiz</h4>
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                                  <div className="flex items-center gap-3">
                                    {progress[
                                      `quiz_${course.modules.find((m) => m.id === selectedModule)?.quiz?.id}`
                                    ] ? (
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <FileText className="w-5 h-5 text-blue-500" />
                                    )}
                                    <div>
                                      <h5 className="font-medium">
                                        {course.modules.find((m) => m.id === selectedModule)?.quiz?.title}
                                      </h5>
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>
                                          {course.modules.find((m) => m.id === selectedModule)?.quiz?.questions.length}{" "}
                                          questions
                                        </span>
                                        {course.modules.find((m) => m.id === selectedModule)?.quiz?.timeLimit && (
                                          <>
                                            <Clock className="w-4 h-4" />
                                            <span>
                                              {course.modules.find((m) => m.id === selectedModule)?.quiz?.timeLimit} min
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() =>
                                      startQuiz(course.modules.find((m) => m.id === selectedModule)?.quiz!)
                                    }
                                    disabled={!course.modules.find((m) => m.id === selectedModule)?.quiz}
                                  >
                                    {progress[`quiz_${course.modules.find((m) => m.id === selectedModule)?.quiz?.id}`]
                                      ? "Retake Quiz"
                                      : "Take Quiz"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Lesson Content */}
                    {selectedLesson && !quizAttempt && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>
                                {
                                  course.modules
                                    .find((m) => m.id === selectedModule)
                                    ?.lessons.find((l) => l.id === selectedLesson)?.title
                                }
                              </CardTitle>
                              {progress[`${selectedModule}_${selectedLesson}`]?.completed && (
                                <div className="flex items-center text-green-600 text-sm mt-1">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Completed on{" "}
                                  {new Date(
                                    progress[`${selectedModule}_${selectedLesson}`].completedAt!,
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <Button variant="outline" onClick={() => setSelectedLesson(null)}>
                              Back to Module
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const lesson = course.modules
                              .find((m) => m.id === selectedModule)
                              ?.lessons.find((l) => l.id === selectedLesson)
                            if (!lesson) return null

                            return (
                              <div className="space-y-6">
                                {/* Video Content */}
                                {lesson.videoUrl && (
                                  <div>
                                    <h4 className="font-medium mb-3">Video Content</h4>
                                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                      <div className="text-center">
                                        <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Video: {lesson.videoUrl}</p>
                                        <p className="text-xs text-gray-500 mt-1">Click to play video content</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Text Content */}
                                <div>
                                  <h4 className="font-medium mb-3">Lesson Content</h4>
                                  <div className="prose max-w-none">
                                    <p className="text-gray-700 leading-relaxed">{lesson.content}</p>
                                  </div>
                                </div>

                                {/* PDF Content */}
                                {lesson.pdfUrl && (
                                  <div>
                                    <h4 className="font-medium mb-3">Additional Resources</h4>
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                      <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-red-500" />
                                        <div>
                                          <p className="font-medium">PDF Resource</p>
                                          <p className="text-sm text-gray-600">{lesson.pdfUrl}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Mark Complete Button */}
                                <div className="flex justify-between items-center pt-6 border-t">
                                  <Button variant="outline" onClick={() => setSelectedLesson(null)}>
                                    Back to Module
                                  </Button>
                                  {!progress[`${selectedModule}_${selectedLesson}`] && (
                                    <Button
                                      onClick={() => markLessonComplete(selectedModule, selectedLesson)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark as Complete
                                    </Button>
                                  )}
                                  {progress[`${selectedModule}_${selectedLesson}`] && (
                                    <div className="flex items-center text-green-600">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Completed
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                        </CardContent>
                      </Card>
                    )}

                    {/* Quiz Interface */}
                    {quizAttempt && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>{course.modules.find((m) => m.id === selectedModule)?.quiz?.title}</CardTitle>
                            {quizAttempt.timeRemaining && (
                              <div className="flex items-center gap-2 text-orange-600">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono">
                                  {Math.floor(quizAttempt.timeRemaining / 60)}:
                                  {(quizAttempt.timeRemaining % 60).toString().padStart(2, "0")}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const quiz = course.modules.find((m) => m.id === selectedModule)?.quiz
                            if (!quiz) return null

                            return (
                              <div className="space-y-6">
                                {quiz.questions.map((question, questionIndex) => (
                                  <div key={question.id} className="border rounded-lg p-4">
                                    <h4 className="font-medium mb-3">
                                      Question {questionIndex + 1}: {question.question}
                                    </h4>
                                    <div className="space-y-2">
                                      {question.options.map((option, optionIndex) => (
                                        <label
                                          key={optionIndex}
                                          className="flex items-center gap-3 p-2 rounded border cursor-pointer hover:bg-gray-50"
                                        >
                                          <input
                                            type="radio"
                                            name={`question-${questionIndex}`}
                                            value={optionIndex}
                                            checked={quizAttempt.answers[questionIndex] === optionIndex}
                                            onChange={() => updateQuizAnswer(questionIndex, optionIndex)}
                                            className="text-blue-600"
                                          />
                                          <span>{option}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ))}

                                <div className="flex justify-between items-center pt-6 border-t">
                                  <Button variant="outline" onClick={() => setQuizAttempt(null)}>
                                    Cancel Quiz
                                  </Button>
                                  <Button
                                    onClick={() => submitQuiz(quiz)}
                                    disabled={quizAttempt.answers.includes(-1)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Submit Quiz
                                  </Button>
                                </div>
                              </div>
                            )
                          })()}
                        </CardContent>
                      </Card>
                    )}

                    {/* Quiz Results */}
                    {quizResults && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Quiz Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-6">
                            <div className="text-4xl font-bold mb-2 text-blue-600">{quizResults.score}%</div>
                            <p className="text-gray-600 mb-4">
                              {quizResults.score >= 70
                                ? "Congratulations! You passed!"
                                : "Keep studying and try again!"}
                            </p>
                            <div className="flex justify-center gap-4 text-sm text-gray-500">
                              <span>
                                Time: {Math.floor(quizResults.timeSpent / 60)}m {quizResults.timeSpent % 60}s
                              </span>
                              <span>Completed: {new Date(quizResults.completedAt).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <Button
                              onClick={() => {
                                setQuizResults(null)
                                setSelectedLesson(null)
                              }}
                            >
                              Continue Learning
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {calculateCourseProgress() === 100 && (
            <TabsContent value="certificate">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                      <Award className="w-8 h-8 text-yellow-500" />
                      Course Completion Certificate
                    </CardTitle>
                    <CardDescription>Congratulations on completing {course.title}!</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!certificate ? (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Ready to Generate Your Certificate</h3>
                        <p className="text-gray-600 mb-6">
                          You've successfully completed all course requirements. Generate your official certificate now!
                        </p>
                        <Button onClick={generateCertificate} size="lg" className="bg-green-600 hover:bg-green-700">
                          <Award className="w-5 h-5 mr-2" />
                          Generate Certificate
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Certificate Preview */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg border-2 border-blue-200">
                          <div className="text-center space-y-4">
                            <div className="text-3xl font-bold text-blue-800">Certificate of Completion</div>
                            <div className="text-lg text-gray-700">This is to certify that</div>
                            <div className="text-2xl font-bold text-blue-800">{certificate.learnerName}</div>
                            <div className="text-lg text-gray-700">has successfully completed the course</div>
                            <div className="text-xl font-semibold text-blue-800">{certificate.courseName}</div>
                            <div className="text-base text-gray-600">Instructor: {certificate.instructorName}</div>
                            <div className="text-base text-gray-600">
                              Date: {new Date(certificate.completionDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">Certificate ID: {certificate.id}</div>
                          </div>
                        </div>

                        {/* Certificate Actions */}
                        <div className="flex justify-center gap-4">
                          {certificate.certificateUrl ? (
                            <Button onClick={downloadCertificate} size="lg" className="bg-green-600 hover:bg-green-700">
                              Download Certificate
                            </Button>
                          ) : (
                            <Button onClick={() => generatePDFCertificate(certificate)} size="lg" variant="outline">
                              Generate Download
                            </Button>
                          )}
                        </div>

                        {/* Certificate Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                          <div>
                            <h4 className="font-medium mb-2">Course Details</h4>
                            <p className="text-sm text-gray-600">Course: {certificate.courseName}</p>
                            <p className="text-sm text-gray-600">Instructor: {certificate.instructorName}</p>
                            <p className="text-sm text-gray-600">
                              Completed: {new Date(certificate.completionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Achievement Summary</h4>
                            <p className="text-sm text-gray-600">
                              Lessons Completed: {detailedProgress?.lessonsCompleted}/{detailedProgress?.totalLessons}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quizzes Passed: {detailedProgress?.quizzesCompleted}/{detailedProgress?.totalQuizzes}
                            </p>
                            <p className="text-sm text-gray-600">Overall Progress: 100%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
