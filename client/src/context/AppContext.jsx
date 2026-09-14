import { createContext, useState, useEffect} from 'react'
import { jobsData } from '../assets/assets'

export const AppContext = createContext()

export const AppContextProvider = (props) => {

  const [searchFilter, setSearchFilter] = useState({
    title: '',
    location: ''
  })
  const [isSearched, setIsSearched] = useState(false)

  const [jobs,setJobs] = useState([])

  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

  const fetchJobs = async () => {
    setJobs(jobsData)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const value = {
    jobs,
    setJobs,
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    showRecruiterLogin,
    setShowRecruiterLogin
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}
