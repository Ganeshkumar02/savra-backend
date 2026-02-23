import fs from "fs"
import csv from "csv-parser"
import Activity from "../models/activity.model.js"




export const importCSV = async () => {
  const results = []

  fs.createReadStream("data.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      for (let row of results) {
        try {
          await Activity.create({
            teacher_id: row.Teacher_id,
            teacher_name: row.Teacher_name,
            grade: row.Grade,
            subject: row.Subject,
            activity_type: row.Activity_type,
            created_at: new Date(row.Created_at)
          })
        } catch (err) {
          console.log("Duplicate skipped")
        }
      }
      console.log("Data Imported")
    })
}