import mongoose from "mongoose"
import dotenv from "dotenv"
import app from "./app.js"

dotenv.config()

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected")
    console.log("Connected DB:", mongoose.connection.name)
  })
  .catch(err => console.log(err))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})