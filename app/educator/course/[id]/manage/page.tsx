"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, FileText, Video, FileDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface User {
  email: string
  role: string
  name: string
}

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
  attempts: number
  order: number
}

interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string
  pdfUrl?: string
  order: number
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  quizzes: Quiz[] // Added quizzes array to modules
  order: number
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  createdAt: string
  enrollments: number
  modules: Module[]
}

export default function ManageCoursePage() {
  const [user, setUser] = useState<User | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [showLessonDialog, setShowLessonDialog] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string>("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [showQuizDialog, setShowQuizDialog] = useState(false) // Added quiz dialog state
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [selectedModuleIdForQuiz, setSelectedModuleIdForQuiz] = useState<string>("")

  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

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
        // Ensure modules array exists and has quizzes
        if (!foundCourse.modules) {
          foundCourse.modules = []
        }
        foundCourse.modules = foundCourse.modules.map((module: Module) => ({
          ...module,
          quizzes: module.quizzes || [],
        }))
        setCourse(foundCourse)
        setModules(foundCourse.modules || [])
      } else {
        router.push("/educator/dashboard")
      }
    } else {
      router.push("/educator/dashboard")
    }
  }

  const saveCourse = (updatedCourse: Course) => {
    if (!user) return

    const storedCourses = localStorage.getItem(`courses_${user.email}`)
    const courses = storedCourses ? JSON.parse(storedCourses) : []
    const updatedCourses = courses.map((c: Course) => (c.id === updatedCourse.id ? updatedCourse : c))
    localStorage.setItem(`courses_${user.email}`, JSON.stringify(updatedCourses))
  }

  const handleCreateModule = () => {
    setEditingModule(null)
    setModuleTitle("")
    setModuleDescription("")
    setShowModuleDialog(true)
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleTitle(module.title)
    setModuleDescription(module.description)
    setShowModuleDialog(true)
  }

  const handleSaveModule = () => {
    if (!moduleTitle.trim() || !course) {
      setError("Module title is required")
      return
    }

    const newModule: Module = {
      id: editingModule?.id || Date.now().toString(),
      title: moduleTitle.trim(),
      description: moduleDescription.trim(),
      lessons: editingModule?.lessons || [],
      quizzes: editingModule?.quizzes || [], // Added quizzes to new module
      order: editingModule?.order || modules.length + 1,
    }

    let updatedModules: Module[]
    if (editingModule) {
      updatedModules = modules.map((m) => (m.id === editingModule.id ? newModule : m))
    } else {
      updatedModules = [...modules, newModule]
    }

    setModules(updatedModules)
    const updatedCourse = { ...course, modules: updatedModules }
    setCourse(updatedCourse)
    saveCourse(updatedCourse)
    setShowModuleDialog(false)
    setError("")
  }

  const handleDeleteModule = (moduleId: string) => {
    if (!course) return

    const updatedModules = modules.filter((m) => m.id !== moduleId)
    setModules(updatedModules)
    const updatedCourse = { ...course, modules: updatedModules }
    setCourse(updatedCourse)
    saveCourse(updatedCourse)
  }

  const handleCreateLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    setEditingLesson(null)
    setLessonTitle("")
    setLessonContent("")
    setLessonVideoUrl("")
    setLessonPdfUrl("")
    setShowLessonDialog(true)
  }

  const handleEditLesson = (lesson: Lesson, moduleId: string) => {
    setSelectedModuleId(moduleId)
    setEditingLesson(lesson)
    setLessonTitle(lesson.title)
    setLessonContent(lesson.content)
    setLessonVideoUrl(lesson.videoUrl || "")
    setLessonPdfUrl(lesson.pdfUrl || "")
    setShowLessonDialog(true)
  }

  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !lessonContent.trim() || !course) {
      setError("Lesson title and content are required")
      return
    }

    const targetModule = modules.find((m) => m.id === selectedModuleId)
    if (!targetModule) return

    const newLesson: Lesson = {
      id: editingLesson?.id || Date.now().toString(),
      title: lessonTitle.trim(),
      content: lessonContent.trim(),
      videoUrl: lessonVideoUrl.trim() || undefined,
      pdfUrl: lessonPdfUrl.trim() || undefined,
      order: editingLesson?.order || targetModule.lessons.length + 1,
    }

    let updatedLessons: Lesson[]
    if (editingLesson) {
      updatedLessons = targetModule.lessons.map((l) => (l.id === editingLesson.id ? newLesson : l))
    } else {
      updatedLessons = [...targetModule.lessons, newLesson]
    }

    const updatedModules = modules.map((m) => (m.id === selectedModuleId ? { ...m, lessons: updatedLessons } : m))

    setModules(updatedModules)
    const updatedCourse = { ...course, modules: updatedModules }
    setCourse(updatedCourse)
    saveCourse(updatedCourse)
    setShowLessonDialog(false)
    setError("")
  }

  const handleDeleteLesson = (lessonId: string, moduleId: string) => {
    if (!course) return

    const updatedModules = modules.map((m) =>
      m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m,
    )

    setModules(updatedModules)
    const updatedCourse = { ...course, modules: updatedModules }
    setCourse(updatedCourse)
    saveCourse(updatedCourse)
  }

  const handleCreateQuiz = (moduleId: string) => {
    setSelectedModuleIdForQuiz(moduleId)
    setEditingQuiz(null)
    setQuizTitle("")
    setQuizDescription("")
    setQuizTimeLimit("")
    setQuizAttempts("3")
    setQuestions([])
    setShowQuizDialog(true)
  }

  const handleEditQuiz = (quiz: Quiz, moduleId: string) => {
    setSelectedModuleIdForQuiz(moduleId)
    setEditingQuiz(quiz)
    setQuizTitle(quiz.title)
    setQuizDescription(quiz.description)
    setQuizTimeLimit(quiz.timeLimit?.toString() || "")
    setQuizAttempts(quiz.attempts.toString())
    setQuestions(quiz.questions)
    setShowQuizDialog(true)
  }

  const handleSaveQuiz = () => {
    if (!quizTitle.trim() || questions.length === 0 || !course) {
      setError("Quiz title and at least one question are required")
      return
    }

    const targetModule = modules.find((m) => m.id === selectedModuleIdForQuiz)
    if (!targetModule) return

    const newQuiz: Quiz = {
      id: editingQuiz?.id || Date.now().toString(),
      title: quizTitle.trim(),
      description: quizDescription.trim(),
      questions: questions,
      timeLimit: quizTimeLimit ? Number.parseInt(quizTimeLimit) : undefined,
      attempts: Number.parseInt(quizAttempts),
      order: editingQuiz?.order || (targetModule.quizzes?.length || 0) + 1,
    }

    let updatedQuizzes: Quiz[]
    if (editingQuiz) {
      updatedQuizzes = (targetModule.quizzes || []).map((q) => (q.id === editingQuiz.id ? newQuiz : q))
    } else {
      updatedQuizzes = [...(targetModule.quizzes || []), newQuiz]
    }

    const updatedModules = modules.map((m) =>
      m.id === selectedModuleIdForQuiz ? { ...m, quizzes: updatedQuizzes } : m,
    )

    setModules(updatedModules)
    const updatedCourse = { ...course, modules: updatedModules }
    setCourse(updatedCourse)
    saveCourse(updatedCourse)
    setShowQuizDialog(false)
    setError("")
  }

  const handleDeleteQuiz = (quizId: string, moduleId: string) => {
    if (!course) return

    const updatedModules = modules.map((m) =>
      m.id === moduleId ? { ...m, quizzes: (m.quizzes || []).filter((q) => q.id !== quizId) } : m,
    )

    setModules(updatedModules)
    const updatedCourse = { ...course, modules: updatedModules }
    setCourse(updatedCourse)
    saveCourse(updatedCourse)
  }

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setQuestionText("")
    setQuestionOptions(["", "", "", ""])
    setCorrectAnswerIndex(0)
    setQuestionExplanation("")
    setShowQuestionDialog(true)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setQuestionText(question.question)
    setQuestionOptions(question.options)
    setCorrectAnswerIndex(question.correctAnswer)
    setQuestionExplanation(question.explanation || "")
    setShowQuestionDialog(true)
  }

  const handleSaveQuestion = () => {
    if (!questionText.trim() || questionOptions.some((opt) => !opt.trim())) {
      setError("Question text and all options are required")
      return
    }

    const newQuestion: Question = {
      id: editingQuestion?.id || Date.now().toString(),
      question: questionText.trim(),
      options: questionOptions.map((opt) => opt.trim()),
      correctAnswer: correctAnswerIndex,
      explanation: questionExplanation.trim() || undefined,
    }

    let updatedQuestions: Question[]
    if (editingQuestion) {
      updatedQuestions = questions.map((q) => (q.id === editingQuestion.id ? newQuestion : q))
    } else {
      updatedQuestions = [...questions, newQuestion]
    }

    setQuestions(updatedQuestions)
    setShowQuestionDialog(false)
    setError("")
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  // Module form state
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleDescription, setModuleDescription] = useState("")

  // Lesson form state
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonContent, setLessonContent] = useState("")
  const [lessonVideoUrl, setLessonVideoUrl] = useState("")
  const [lessonPdfUrl, setLessonPdfUrl] = useState("")

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [quizTimeLimit, setQuizTimeLimit] = useState("")
  const [quizAttempts, setQuizAttempts] = useState("3")
  const [questions, setQuestions] = useState<Question[]>([])

  // Question form state
  const [questionText, setQuestionText] = useState("")
  const [questionOptions, setQuestionOptions] = useState(["", "", "", ""])
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0)
  const [questionExplanation, setQuestionExplanation] = useState("")

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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/educator/dashboard">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">Manage modules and lessons</p>
          <Badge className="mt-2">{course.category}</Badge>
        </div>

        {/* Create Module Button */}
        <div className="mb-6">
          <Button onClick={handleCreateModule} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </Button>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {modules.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first module</p>
                <Button onClick={handleCreateModule}>Create First Module</Button>
              </CardContent>
            </Card>
          ) : (
            modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5" />
                        <span>{module.title}</span>
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{module.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleCreateLesson(module.id)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Lesson
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleCreateQuiz(module.id)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Quiz
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditModule(module)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Lessons Section */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Lessons</h4>
                    {module.lessons.length === 0 ? (
                      <div className="text-center py-4 border rounded-lg bg-gray-50">
                        <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No lessons in this module</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{lesson.title}</h4>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{lesson.content}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  {lesson.videoUrl && (
                                    <span className="flex items-center space-x-1">
                                      <Video className="w-3 h-3" />
                                      <span>Video</span>
                                    </span>
                                  )}
                                  {lesson.pdfUrl && (
                                    <span className="flex items-center space-x-1">
                                      <FileDown className="w-3 h-3" />
                                      <span>PDF</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button variant="outline" size="sm" onClick={() => handleEditLesson(lesson, module.id)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Quizzes</h4>
                    {(module.quizzes || []).length === 0 ? (
                      <div className="text-center py-4 border rounded-lg bg-gray-50">
                        <div className="w-6 h-6 text-gray-400 mx-auto mb-2 flex items-center justify-center">
                          <span className="text-lg">?</span>
                        </div>
                        <p className="text-gray-600 text-sm">No quizzes in this module</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(module.quizzes || []).map((quiz) => (
                          <div key={quiz.id} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">{quiz.title}</h5>
                                <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>{quiz.questions.length} questions</span>
                                  {quiz.timeLimit && <span>{quiz.timeLimit} minutes</span>}
                                  <span>{quiz.attempts} attempts allowed</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button variant="outline" size="sm" onClick={() => handleEditQuiz(quiz, module.id)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteQuiz(quiz.id, module.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
            <DialogDescription>
              {editingModule ? "Update module details" : "Add a new module to organize your lessons"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="moduleTitle">Module Title *</Label>
              <Input
                id="moduleTitle"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Enter module title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleDescription">Description</Label>
              <Textarea
                id="moduleDescription"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Brief description of this module"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModule} disabled={loading}>
              {editingModule ? "Update Module" : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
            <DialogDescription>
              {editingLesson ? "Update lesson content" : "Add a new lesson with text, video, and PDF resources"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">Lesson Title *</Label>
              <Input
                id="lessonTitle"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Enter lesson title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonContent">Lesson Content *</Label>
              <Textarea
                id="lessonContent"
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Write your lesson content here..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonVideoUrl">Video URL (optional)</Label>
              <Input
                id="lessonVideoUrl"
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonPdfUrl">PDF URL (optional)</Label>
              <Input
                id="lessonPdfUrl"
                value={lessonPdfUrl}
                onChange={(e) => setLessonPdfUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} disabled={loading}>
              {editingLesson ? "Update Lesson" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
            <DialogDescription>
              {editingQuiz ? "Update quiz details and questions" : "Create a new quiz with multiple-choice questions"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Quiz Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quizTitle">Quiz Title *</Label>
                <Input
                  id="quizTitle"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quizTimeLimit">Time Limit (minutes)</Label>
                <Input
                  id="quizTimeLimit"
                  type="number"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quizDescription">Description</Label>
                <Textarea
                  id="quizDescription"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Brief description of this quiz"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quizAttempts">Attempts Allowed</Label>
                <Input
                  id="quizAttempts"
                  type="number"
                  min="1"
                  value={quizAttempts}
                  onChange={(e) => setQuizAttempts(e.target.value)}
                />
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Questions ({questions.length})</h4>
                <Button onClick={handleAddQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-gray-50">
                  <p className="text-gray-600">No questions added yet</p>
                  <Button onClick={handleAddQuestion} variant="outline" size="sm" className="mt-2 bg-transparent">
                    Add First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-2">
                            {index + 1}. {question.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded ${
                                  optIndex === question.correctAnswer ? "bg-green-100 text-green-800" : "bg-gray-100"
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditQuestion(question)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuizDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuiz} disabled={loading}>
              {editingQuiz ? "Update Quiz" : "Create Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
            <DialogDescription>Create a multiple-choice question with four options</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="questionText">Question *</Label>
              <Textarea
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question here..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Answer Options *</Label>
              {questionOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswerIndex === index}
                    onChange={() => setCorrectAnswerIndex(index)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label className="w-8 text-sm font-medium">{String.fromCharCode(65 + index)}.</Label>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...questionOptions]
                      newOptions[index] = e.target.value
                      setQuestionOptions(newOptions)
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                </div>
              ))}
              <p className="text-xs text-gray-600">Select the radio button next to the correct answer</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionExplanation">Explanation (optional)</Label>
              <Textarea
                id="questionExplanation"
                value={questionExplanation}
                onChange={(e) => setQuestionExplanation(e.target.value)}
                placeholder="Explain why this answer is correct..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>{editingQuestion ? "Update Question" : "Add Question"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
