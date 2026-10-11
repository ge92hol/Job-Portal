import { useContext, useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/react'
import Navbar from '../components/Navbar.jsx'
import Loading from '../components/Loading.jsx'
import { assets } from '../assets/assets.js'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'

const Applications = () => {

  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)

  const {
    backendUrl,
    userData,
    userApplications,
    fetchUserData,
    fetchUserApplications
  } = useContext(AppContext)

  const updateResume = async () => {
  try {
    const formData = new FormData()
    formData.append('resume', resume)

    const token = await getToken()

    const { data } = await axios.post(
      backendUrl + '/api/users/update-resume',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (data.success) {
      toast.success(data.message)
      await fetchUserData()
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(error.message)
  }

  setIsEdit(false)
  setResume(null)
}

  useEffect(() =>
  {
    if(user)
    {
      fetchUserApplications()
    }

  },[user])

  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <Loading />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10 flex items-center justify-center'>
          <p className='text-lg text-gray-600'>Please log in to view your applications.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>

        {/* Resume */}
        <h2 className='text-xl font-semibold'>
          Your Resume
        </h2>

        <div className='flex gap-2 mb-6 mt-3'>

          {
            isEdit || !userData || userData.resume === ""
              ? (
                <>
                  <label
                    className='flex items-center cursor-pointer'
                    htmlFor='resumeUpload'
                  >

                    <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>
                      {resume ? resume.name : 'Upload Resume'}
                    </p>

                    <input
                      id='resumeUpload'
                      onChange={(e) => setResume(e.target.files[0])}
                      accept='application/pdf'
                      type='file'
                      hidden
                    />

                    <img
                      src={assets.profile_upload_icon}
                      alt=''
                    />

                  </label>

                  <button
                    onClick={updateResume}
                    className='bg-green-100 border border-green-400 rounded-lg px-4 py-2 cursor-pointer'
                  >
                    Save
                  </button>
                </>
              )
              : (
                <div className='flex gap-2'>

                  <a
                    className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg'
                    target = '_blank'
                    href={userData.resume}
                  >
                    Resume
                  </a>

                  <button
                    onClick={() => setIsEdit(true)}
                    className='text-gray-500 border border-gray-400 rounded-lg px-4 py-2 cursor-pointer'
                  >
                    Edit
                  </button>

                </div>
              )
          }

        </div>


        {/* Jobs Applied */}
        <h2 className='text-xl font-semibold mb-4'>
          Jobs Applied
        </h2>

        <div className='overflow-hidden rounded-lg border border-gray-300'>

          <table className='min-w-full bg-white'>

            <thead>

              <tr>

                <th className='py-3 px-4 border-b border-gray-300 text-left'>
                  Company
                </th>

                <th className='py-3 px-4 border-b border-gray-300 text-left'>
                  Job Title
                </th>

                <th className='py-3 px-4 border-b border-gray-300 text-left max-sm:hidden'>
                  Location
                </th>

                <th className='py-3 px-4 border-b border-gray-300 text-left max-sm:hidden'>
                  Date
                </th>

                <th className='py-3 px-4 border-b border-gray-300 text-left'>
                  Status
                </th>

              </tr>

            </thead>


            <tbody className='divide-y divide-gray-200'>

              {userApplications.map((job, index) => (

                <tr key={index}>

                  <td className='py-3 px-4'>

                    <div className='flex items-center gap-2'>

                      <img
                        className='w-8 h-8'
                        src={job.companyId.image}
                        alt=''
                      />

                      {job.companyId.name}

                    </div>

                  </td>

                  <td className='py-2 px-4'>
                    {job.jobId.title}
                  </td>

                  <td className='py-2 px-4 max-sm:hidden'>
                    {job.jobId.location}
                  </td>

                  <td className='py-2 px-4 max-sm:hidden'>
                    {moment(job.date).format('ll')}
                  </td>

                  <td className='py-2 px-4'>

                    <span
                      className={`${
                        job.status === 'Accepted'
                          ? 'bg-green-100'
                          : job.status === 'Rejected'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                      } px-4 py-1.5 rounded`}
                    >
                      {job.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    </>
  )
}

export default Applications