import User from '../models/User.js'
import Job from '../models/Job.js'
import JobApplication from '../models/JobApplication.js'
import { clerkClient, getAuth } from '@clerk/express'

// Get user data
export const getUserData = async (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }
  console.log(`[getUserData] Looking up Clerk user ${userId}`)

  try {
    let user = await User.findById(userId)

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId)
      const email = clerkUser.emailAddresses[0]?.emailAddress
      const existingUser = email ? await User.findOne({ email }) : null

      if (existingUser) {
        await JobApplication.updateMany(
          { userId: existingUser._id },
          { $set: { userId } }
        )
        await User.deleteOne({ _id: existingUser._id })
        user = await User.create({
          _id: userId,
          name: existingUser.name,
          email,
          resume: existingUser.resume || '',
          image: clerkUser.imageUrl || existingUser.image
        })
      } else {
        return res.status(404).json({
          success: false,
          message: 'User Not Found'
        })
      }
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}


// Apply for a job
export const applyForJob = async (req, res) => {
  const { jobId } = req.body

  const { userId } = getAuth(req)
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }

  try {
    const isAlreadyApplied = await JobApplication.find({ jobId, userId })

    if (isAlreadyApplied.length > 0) {
      return res.json({
        success: false,
        message: 'Already Applied'
      })
    }

    const jobData = await Job.findById(jobId)

    if (!jobData) {
      return res.json({
        success: false,
        message: 'Job Not Found'
      })
    }

    await JobApplication.create({
      companyId: jobData.companyId,
      userId,
      jobId,
      date: Date.now()
    })

    res.json({
      success: true,
      message: 'Applied Successfully'
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}

// Get user applied applications
export const getUserJobApplications = async (req, res) => {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    const applications = await JobApplication.find({ userId })
      .populate('companyId', 'name email image')
      .populate(
        'jobId',
        'title description location category level salary'
      )
      .exec()

    if (!applications) {
      return res.json({
        success: false,
        message: 'No job applications found for this user.'
      })
    }

    return res.json({
      success: true,
      applications
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}

export const updateUserResume = async (req, res) => {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    const resumeFile = req.file

    const userData = await User.findById(userId)

    if (resumeFile) {
      const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)

      userData.resume = resumeUpload.secure_url
    }

    await userData.save()

    return res.json({
      success: true,
      message: 'Resume Updated'
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}