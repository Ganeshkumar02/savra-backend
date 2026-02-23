import express from "express"
import cors from "cors"
import analyticsRoutes from "./routes/analytics.routes.js"

const app = express()

app.use(cors())
app.use(express.json())


app.use("/api/analytics", analyticsRoutes)

export default app