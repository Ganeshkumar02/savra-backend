import Activity from "../models/activity.model.js"


// ✅ DASHBOARD SUMMARY (WITH FILTERS)
export const getSummary = async (req, res) => {
  try {
    const { grade, subject } = req.query

    const match = {}

    if (grade) match.Grade = Number(grade)
    if (subject) match.Subject = subject

    const totalTeachers = await Activity.distinct("Teacher_id", match)

    const lessons = await Activity.countDocuments({
      ...match,
      Activity_type: { $regex: "Lesson", $options: "i" }
    })

    const quizzes = await Activity.countDocuments({
      ...match,
      Activity_type: { $regex: "Quiz", $options: "i" }
    })

    const assessments = await Activity.countDocuments({
      ...match,
      Activity_type: { $regex: "Question", $options: "i" }
    })

    res.json({
      active_teachers: totalTeachers.length,
      lessons,
      quizzes,
      assessments
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ✅ WEEKLY TREND (WITH FILTERS + ACTIVITY TYPE)
export const getWeeklyTrend = async (req, res) => {
  try {
    const { grade, subject } = req.query

    const match = {}

    if (grade) match.Grade = Number(grade)
    if (subject) match.Subject = subject

    const data = await Activity.aggregate([
      {
        $addFields: {
          createdDate: {
            $dateFromString: {
              dateString: "$Created_at"
            }
          }
        }
      },
      { $match: match },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$createdDate" },
            type: "$Activity_type"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.day": 1 } }
    ])

    res.json(data)

  } catch (error) {
    res.status(500).json({ message: "Error fetching weekly trend" })
  }
}

// ✅ TEACHER ANALYSIS (UNCHANGED BUT SAFE)
export const getTeacherAnalysis = async (req, res) => {
  try {
    const { id } = req.params
    const { grade, subject, range } = req.query

    const match = { Teacher_id: id }

    if (grade) match.Grade = Number(grade)
    if (subject) match.Subject = subject

    // 🔥 TIME RANGE FILTER
    if (range) {
      const now = new Date()
      let startDate = new Date()

      if (range === "week") {
        startDate.setDate(now.getDate() - 7)
      }

      if (range === "month") {
        startDate.setMonth(now.getMonth() - 1)
      }

      if (range === "year") {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      // Since Created_at is string, convert comparison properly
      match.Created_at = {
        $gte: startDate.toISOString()
      }
    }

    const teacherData = await Activity.find(match)

    if (!teacherData.length) {
      return res.json({
        teacher_name: "",
        subjects: [],
        grades: [],
        lessons: 0,
        quizzes: 0,
        assessments: 0,
        classBreakdown: {},
        recent: []
      })
    }

    const lessons = teacherData.filter(a =>
      a.Activity_type.includes("Lesson")
    ).length

    const quizzes = teacherData.filter(a =>
      a.Activity_type.includes("Quiz")
    ).length

    const assessments = teacherData.filter(a =>
      a.Activity_type.includes("Question")
    ).length

    const classBreakdown = {}

    teacherData.forEach(a => {
      if (!classBreakdown[a.Grade]) {
        classBreakdown[a.Grade] = 0
      }
      classBreakdown[a.Grade]++
    })

    const subjects = [...new Set(teacherData.map(a => a.Subject))]
    const grades = [...new Set(teacherData.map(a => a.Grade))]

    res.json({
      teacher_name: teacherData[0].Teacher_name,
      subjects,
      grades,
      lessons,
      quizzes,
      assessments,
      classBreakdown,
      recent: teacherData.slice(-5).reverse()
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


// ✅GET ALLL TEACHER ANALYSIS (UNCHANGED BUT SAFE)
export const getAllTeachers = async (req, res) => {
  const teachers = await Activity.aggregate([
    {
      $group: {
        _id: "$Teacher_id",
        Teacher_name: { $first: "$Teacher_name" },
        Grade: { $first: "$Grade" }
      }
    }
  ])

  res.json(
    teachers.map(t => ({
      Teacher_id: t._id,
      Teacher_name: t.Teacher_name,
      Grade: t.Grade
    }))
  )
}