import React from 'react'
import Sidebar from './User/components/Sidebar.jsx';
import { Outlet } from 'react-router'
const App = () => {
  return (
    <div className='flex size-full overflow-hidden'>
    <Sidebar />
          <div className="flex-1 overflow-y-auto">
    <Outlet/>
    </div>
    </div>
  )
}

export default App
