import mongoose from "mongoose"

const activitySchema = new mongoose.Schema({
  Teacher_id: { type: String, required: true },
  Teacher_name: { type: String, required: true },
  Grade: { type: Number, required: true },
  Subject: { type: String, required: true },
  Activity_type: { type: String, required: true },
  Created_at: { type: String, }
})

export default mongoose.model("Activity", activitySchema, "activities")