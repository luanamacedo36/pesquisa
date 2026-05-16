import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Survey from './pages/Survey'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <div className="app-header-logo">
          <div className="logo-icon">+</div>
          <h1>
            Pesquisa de Satisfação
            <span>Unidade de Saúde</span>
          </h1>
        </div>
        <nav className="app-header-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            Pesquisa
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            Dashboard
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Survey />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
