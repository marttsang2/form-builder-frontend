import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="bg-background max-w-6xl mx-auto">
      <Outlet />
    </div>
  )
}

export default App
