import { Routes, Route, Link } from 'react-router-dom'
import BlogList from './components/BlogList'
import BlogAddPage from './components/BlogAddPage'
import BlogEditPage from './components/BlogEditPage'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Admin Jashom</h1>
        <nav className="app-nav">
          <Link to="/" className="app-nav-link">All blogs</Link>
          <Link to="/add" className="app-nav-link">Add blog</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/add" element={<BlogAddPage />} />
          <Route path="/edit/:id" element={<BlogEditPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
