import React from 'react'
import PromptForm from './components/PromptForm'
import './App.css'

function App() {
  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1 className="title">🎯 AI PowerPoint Generator</h1>
          <p className="subtitle">
            Transform your ideas into professional presentations using AI
          </p>
        </header>
        
        <main className="main">
          <PromptForm />
        </main>
        
        <footer className="footer">
          <p>Powered by LiteLLM & FastAPI</p>
        </footer>
      </div>
    </div>
  )
}

export default App 