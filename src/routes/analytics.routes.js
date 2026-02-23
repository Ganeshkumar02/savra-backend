import express from "express"
import Activity from "../models/activity.model.js"

import {
  getSummary,
  getWeeklyTrend,
  getTeacherAnalysis,
  getAllTeachers
} from "../controllers/analytics.controller.js"

const router = express.Router()

router.get("/summary", getSummary)
router.get("/weekly", getWeeklyTrend)
router.get("/teacher/:id", getTeacherAnalysis)
router.get("/teachers", getAllTeachers)

router.get("/check", async (req, res) => {
  const data = await Activity.find()
  res.json(data)
})

export default router