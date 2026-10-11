import mongoose from 'mongoose'

const connectDB = async () => {
  mongoose.connection.on('connected', () =>
    console.log('Database Connected')
  )

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from server/.env')
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'job-portal',
    serverSelectionTimeoutMS: 10000
  })

  console.log(`MongoDB database: ${mongoose.connection.name}`)
}

export default connectDB