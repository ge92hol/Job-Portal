import './config/instrument.js'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import {clerkMiddleware} from '@clerk/express'


const app = express()

try {
  await connectDB()
  await connectCloudinary()
} catch (error) {
  console.error('Backend startup failed: MongoDB could not be reached.')
  console.error(error.message)
  process.exit(1)
}

app.use(cors())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send('API Working')})
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");});

app.post(
  '/webhooks/clerk',
  express.raw({ type: 'application/json' }),
  clerkWebhooks
)
app.use(express.json())
app.use('/api/company', companyRoutes)
app.use('/api/job', jobRoutes)
app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})