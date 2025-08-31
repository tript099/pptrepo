import React, { useState } from 'react'
import axios from 'axios'
import AdvancedEditor from './AdvancedEditor'
import TemplateUploader from './TemplateUploader'
import SlideVisualPreview from './SlideVisualPreview'
import './PromptForm.css'

// Configure API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const PromptForm = () => {
  const [prompt, setPrompt] = useState('')
  const [outputFormat, setOutputFormat] = useState('pptx')
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [currentSlideData, setCurrentSlideData] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showTemplateUploader, setShowTemplateUploader] = useState(false)
  const [uploadedTemplate, setUploadedTemplate] = useState(null)
  const [uploadedLogo, setUploadedLogo] = useState(null)
  const [generatedPresentations, setGeneratedPresentations] = useState([])
  const [uploadedPPTFile, setUploadedPPTFile] = useState(null)
  const [extractingPPT, setExtractingPPT] = useState(false)
  
  // New states for prompt-based editing
  const [editPrompt, setEditPrompt] = useState('')
  const [editSlideNumber, setEditSlideNumber] = useState('')
  const [uploadedEditFile, setUploadedEditFile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // New states for live preview
  const [previewData, setPreviewData] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [isApplyingEdits, setIsApplyingEdits] = useState(false)
  const [currentEditInstructions, setCurrentEditInstructions] = useState(null)

  const examplePrompts = [
    "Create a Q2 business review presentation for a SaaS company with revenue charts and key metrics",
    "Generate a marketing strategy presentation for launching a new mobile app",
    "Build a project status update deck with timeline, milestones, and team progress",
    "Create an employee onboarding presentation with company values and processes"
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      setStatus('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setStatus('🤖 AI is creating your presentation...')

    try {
      // Create FormData for file uploads
      const formData = new FormData()
      formData.append('prompt', prompt.trim())
      formData.append('output_format', outputFormat)
      
      if (uploadedTemplate) {
        formData.append('template', uploadedTemplate)
      }
      
      if (uploadedLogo) {
        formData.append('logo', uploadedLogo)
        formData.append('logo_position', 'top-right') // Default position
        formData.append('logo_size', 'medium')
      }

      const response = await axios.post(`${API_BASE_URL}/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        timeout: 120000 // 2 minute timeout
      })

      // Extract filename from content-disposition header or create a default name
      let filename = `presentation.${outputFormat}`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // Add to generated presentations list
      const newPresentation = {
        id: Date.now(),
        filename,
        prompt: prompt.trim(),
        createdAt: new Date().toLocaleString(),
        hasTemplate: !!uploadedTemplate,
        hasLogo: !!uploadedLogo
      }
      setGeneratedPresentations(prev => [newPresentation, ...prev])

      setStatus('✅ Presentation generated successfully!')
      
    } catch (error) {
      console.error('Generation error:', error)
      console.error('Error details:', error.response?.data, error.response?.status)
      
      if (error.response?.status === 200) {
        setStatus('✅ Presentation generated successfully!')
      } else {
        setStatus('❌ Failed to generate presentation. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditRequest = async () => {
    if (!prompt.trim()) {
      setStatus('Please enter a prompt first to generate slide structure')
      return
    }

    setStatus('🔄 Generating slide structure for editing...')
    
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-structure`, {
        prompt: prompt.trim()
      })
      
      setCurrentSlideData(response.data)
      setShowEditor(true)
      setStatus('')
    } catch (error) {
      console.error('Structure generation error:', error)
      setStatus('❌ Failed to generate slide structure. Please try again.')
    }
  }

  const handleSaveEdits = async (editedData) => {
    setIsGenerating(true)
    setStatus('💾 Saving your changes...')

    try {
      const formData = new FormData()
      formData.append('slide_data', JSON.stringify(editedData))
      formData.append('output_format', outputFormat)
      
      if (uploadedTemplate) {
        formData.append('template', uploadedTemplate)
      }
      
      if (uploadedLogo) {
        formData.append('logo', uploadedLogo)
        formData.append('logo_position', 'top-right')
        formData.append('logo_size', 'medium')
      }

      const response = await axios.post(`${API_BASE_URL}/generate-from-structure`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        timeout: 120000
      })

      // Handle download
      let filename = `edited_presentation.${outputFormat}`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setShowEditor(false)
      setStatus('✅ Edited presentation saved successfully!')
      
    } catch (error) {
      console.error('Save error:', error)
      setStatus('❌ Failed to save changes. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePPTUpload = async (file) => {
    setExtractingPPT(true)
    setStatus('🔍 Extracting slides from your PowerPoint file...')
    
    try {
      const formData = new FormData()
      formData.append('ppt_file', file)

      const response = await axios.post(`${API_BASE_URL}/extract-from-ppt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000
      })

      if (response.data.success) {
        setCurrentSlideData(response.data.slide_data)
        setUploadedPPTFile(file)
        setShowEditor(true)
        setStatus(`✅ Successfully loaded ${response.data.slide_data.slides.length} slides for editing!`)
      } else {
        throw new Error(response.data.message || 'Failed to extract slide data')
      }
    } catch (error) {
      console.error('PPT upload error:', error)
      setStatus('❌ Failed to extract slide data from PowerPoint file. Please try again.')
    } finally {
      setExtractingPPT(false)
    }
  }

  const handleExampleClick = (examplePrompt) => {
    setPrompt(examplePrompt)
  }

  const handlePromptBasedEdit = async (e) => {
    e.preventDefault()
    
    if (!uploadedEditFile) {
      setStatus('Please upload a PowerPoint file to edit')
      return
    }
    
    if (!editPrompt.trim()) {
      setStatus('Please enter an edit prompt')
      return
    }

    setIsGeneratingPreview(true)
    setStatus('🎬 Generating live preview...')
    setShowPreview(false)

    try {
      const formData = new FormData()
      formData.append('file', uploadedEditFile)
      formData.append('edit_prompt', editPrompt.trim())
      formData.append('output_format', outputFormat)
      
      if (editSlideNumber && !isNaN(editSlideNumber)) {
        formData.append('slide_number', editSlideNumber)
      }

      const response = await axios.post(`${API_BASE_URL}/preview-edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000 // 2 minute timeout
      })

      setPreviewData(response.data.preview_data)
      setCurrentEditInstructions(response.data.edit_instructions)
      setShowPreview(true)
      setStatus('✅ Preview generated! Review changes below.')
      
    } catch (error) {
      console.error('Preview error:', error)
      
      if (error.response?.status === 500) {
        setStatus('❌ Server error during preview generation. Please check your prompt and try again.')
      } else if (error.code === 'ECONNABORTED') {
        setStatus('❌ Request timeout. The preview took too long. Please try a simpler edit.')
      } else {
        setStatus('❌ Failed to generate preview. Please try again.')
      }
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleApplyEdits = async () => {
    if (!uploadedEditFile || !currentEditInstructions) {
      setStatus('❌ Missing edit data. Please generate a preview first.')
      return
    }

    setIsApplyingEdits(true)
    setStatus('⚡ Applying changes and preparing download...')

    try {
      const formData = new FormData()
      formData.append('file', uploadedEditFile)
      formData.append('edit_instructions', JSON.stringify(currentEditInstructions))
      formData.append('output_format', outputFormat)
      
      if (editSlideNumber && !isNaN(editSlideNumber)) {
        formData.append('slide_number', editSlideNumber)
      }

      const response = await axios.post(`${API_BASE_URL}/apply-preview-edits`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        timeout: 120000 // 2 minute timeout
      })

      // Extract filename from content-disposition header
      let filename = `edited_presentation.${outputFormat}`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setStatus('✅ Presentation edited and downloaded successfully!')
      setEditPrompt('')
      setShowPreview(false)
      setPreviewData(null)
      setCurrentEditInstructions(null)
      
    } catch (error) {
      console.error('Apply edits error:', error)
      
      if (error.response?.status === 500) {
        setStatus('❌ Server error during editing. Please try again.')
      } else if (error.code === 'ECONNABORTED') {
        setStatus('❌ Request timeout. The edit took too long. Please try a simpler edit.')
      } else {
        setStatus('❌ Failed to apply edits. Please try again.')
      }
    } finally {
      setIsApplyingEdits(false)
    }
  }

  return (
    <div className="prompt-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prompt" className="form-label">
            📝 Describe your presentation
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a quarterly business review presentation with sales data, key achievements, and future goals..."
            rows={4}
            className="form-textarea"
            disabled={isGenerating}
          />
        </div>

        <div className="examples-section">
          <p className="examples-label">💡 Try these examples:</p>
          <div className="examples-grid">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                className="example-button"
                onClick={() => handleExampleClick(example)}
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="format" className="form-label">
              📄 Output Format
            </label>
            <select
              id="format"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="form-select"
              disabled={isGenerating}
            >
              <option value="pptx">PowerPoint (.pptx)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>
        </div>

        <div className="ppt-upload-section">
          <div className="upload-header">
            <h3>📁 Or Upload Existing PowerPoint</h3>
            <p>Upload a .ppt or .pptx file to edit existing presentations</p>
          </div>
          
          <div 
            className={`ppt-upload-area ${extractingPPT ? 'uploading' : ''}`}
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file && (file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx'))) {
                handlePPTUpload(file)
              } else {
                alert('Please upload a PowerPoint file (.ppt or .pptx)')
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
          >
            <input
              type="file"
              accept=".ppt,.pptx"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  handlePPTUpload(file)
                  e.target.value = '' // Reset input
                }
              }}
              disabled={extractingPPT}
              style={{ display: 'none' }}
              id="ppt-upload"
            />
            <label htmlFor="ppt-upload" className="upload-label">
              {extractingPPT ? (
                <div className="uploading-content">
                  <div className="spinner"></div>
                  <span>📤 Extracting slides...</span>
                </div>
              ) : (
                <div className="upload-content">
                  <div className="upload-icon">📎</div>
                  <div className="upload-text">
                    <strong>Click to upload</strong> or drag & drop
                    <br />
                    <small>Supports .ppt and .pptx files</small>
                  </div>
                </div>
              )}
            </label>
            
            {uploadedPPTFile && (
              <div className="uploaded-file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{uploadedPPTFile.name}</span>
                <button 
                  type="button"
                  onClick={() => {
                    setUploadedPPTFile(null)
                    setCurrentSlideData(null)
                  }}
                  className="remove-file"
                >
                  ❌
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button 
            type="button"
            onClick={handleEditRequest}
            className="edit-button"
            disabled={isGenerating || !prompt.trim()}
          >
            ✏️ Edit Structure
          </button>
          
          <button 
            type="button"
            onClick={() => setShowTemplateUploader(true)}
            className="template-button"
          >
            📄 Template & Logo
          </button>
          
          <button 
            type="submit" 
            className={`generate-button ${isGenerating ? 'generating' : ''}`}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                🚀 Generate Presentation
              </>
            )}
          </button>
        </div>
      </form>

      {/* Prompt-Based Editing Section */}
      <div className="edit-section">
        <div className="section-header">
          <h3>✏️ Edit Existing Presentation with AI</h3>
          <p>Upload a PowerPoint file and use natural language to edit it</p>
        </div>
        
        <div className="edit-form">
          <div className="edit-upload-group">
            <label className="edit-upload-label">
              📁 Upload PowerPoint to Edit
            </label>
            <input
              type="file"
              accept=".ppt,.pptx"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  setUploadedEditFile(file)
                  setStatus(`📁 Loaded: ${file.name}`)
                }
              }}
              className="edit-file-input"
              disabled={isEditing}
            />
            {uploadedEditFile && (
              <div className="uploaded-file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{uploadedEditFile.name}</span>
                <button 
                  onClick={() => setUploadedEditFile(null)}
                  className="remove-file"
                  disabled={isEditing}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="edit-prompt-group">
            <label htmlFor="editPrompt" className="edit-label">
              💬 Edit Instructions
            </label>
            <textarea
              id="editPrompt"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g., On slide 3, add a pie chart showing market share data with categories: Desktop (45%), Mobile (35%), Tablet (20%)..."
              rows={3}
              className="edit-textarea"
              disabled={isEditing}
            />
          </div>

          <div className="edit-options-group">
            <div className="slide-number-group">
              <label htmlFor="editSlideNumber" className="slide-label">
                📊 Target Slide (optional)
              </label>
              <input
                id="editSlideNumber"
                type="number"
                value={editSlideNumber}
                onChange={(e) => setEditSlideNumber(e.target.value)}
                placeholder="e.g., 3"
                min="1"
                className="slide-input"
                disabled={isEditing}
              />
            </div>

            <div className="output-format-group">
              <label htmlFor="editFormat" className="format-label">
                📄 Output Format
              </label>
              <select
                id="editFormat"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="format-select"
                disabled={isEditing}
              >
                <option value="pptx">PowerPoint (.pptx)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>
          </div>

          <div className="edit-examples">
            <p className="examples-title">💡 Example edit prompts:</p>
            <div className="edit-examples-list">
              <button 
                type="button"
                onClick={() => setEditPrompt("On slide 3, add a pie chart showing market share data with categories: Desktop (45%), Mobile (35%), Tablet (20%)")}
                className="example-edit-button"
                disabled={isEditing}
              >
                Add a pie chart to slide 3
              </button>
              <button 
                type="button"
                onClick={() => setEditPrompt("Change the title from 'Key Benefits' to 'Main Advantages' on slide 2")}
                className="example-edit-button"
                disabled={isEditing}
              >
                Change slide title
              </button>
              <button 
                type="button"
                onClick={() => setEditPrompt("Add bullet point 'Improved customer satisfaction by 25%' to slide 4")}
                className="example-edit-button"
                disabled={isEditing}
              >
                Add bullet point
              </button>
              <button 
                type="button"
                onClick={() => setEditPrompt("Replace the table on slide 5 with a bar chart showing quarterly sales data")}
                className="example-edit-button"
                disabled={isEditing}
              >
                Replace table with chart
              </button>
            </div>
          </div>

          <button 
            type="button"
            onClick={handlePromptBasedEdit}
            className={`edit-submit-button ${isGeneratingPreview ? 'editing' : ''}`}
            disabled={isGeneratingPreview || !uploadedEditFile || !editPrompt.trim()}
          >
            {isGeneratingPreview ? (
              <>
                <span className="spinner"></span>
                Generating Preview...
              </>
            ) : (
              <>
                🎬 Generate Live Preview
              </>
            )}
          </button>
        </div>

        {/* Visual Slide Preview Component */}
        {showPreview && previewData && (
          <SlideVisualPreview 
            previewData={previewData}
            onApplyEdits={handleApplyEdits}
            isApplying={isApplyingEdits}
          />
        )}
      </div>

      {/* Upload Status */}
      {(uploadedTemplate || uploadedLogo) && (
        <div className="upload-status">
          <h4>📎 Uploaded Files:</h4>
          {uploadedTemplate && (
            <div className="upload-item">
              <span className="upload-icon">📄</span>
              <span className="upload-name">{uploadedTemplate.name}</span>
              <button 
                onClick={() => setUploadedTemplate(null)}
                className="remove-upload"
              >
                ✕
              </button>
            </div>
          )}
          {uploadedLogo && (
            <div className="upload-item">
              <span className="upload-icon">🖼️</span>
              <span className="upload-name">{uploadedLogo.name}</span>
              <button 
                onClick={() => setUploadedLogo(null)}
                className="remove-upload"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {status && (
        <div className={`status-message ${status.includes('❌') ? 'error' : status.includes('✅') ? 'success' : 'info'}`}>
          {status}
        </div>
      )}

      {/* Presentation History */}
      {generatedPresentations.length > 0 && (
        <div className="presentation-history">
          <h3 className="history-title">📚 Recent Presentations</h3>
          <div className="history-list">
            {generatedPresentations.slice(0, 5).map(presentation => (
              <div key={presentation.id} className="history-item">
                <div className="history-info">
                  <div className="history-filename">{presentation.filename}</div>
                  <div className="history-prompt">{presentation.prompt.substring(0, 60)}...</div>
                  <div className="history-meta">
                    <span className="history-date">{presentation.createdAt}</span>
                    {presentation.hasTemplate && <span className="history-badge">📄 Template</span>}
                    {presentation.hasLogo && <span className="history-badge">🖼️ Logo</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="features-section">
        <h3 className="features-title">✨ Features</h3>
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">🎨</span>
            <span>Professional templates</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Auto-generated charts</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <span>Smart bullet points</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Instant generation</span>
          </div>
        </div>
      </div>

      {/* Advanced Editor Modal */}
      {showEditor && currentSlideData && (
        <AdvancedEditor
          slideData={currentSlideData}
          onSave={handleSaveEdits}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Template Uploader Modal */}
      {showTemplateUploader && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TemplateUploader
              onTemplateUpload={setUploadedTemplate}
              onLogoUpload={setUploadedLogo}
              currentTemplate={uploadedTemplate}
              currentLogo={uploadedLogo}
            />
            <div className="modal-actions">
              <button 
                onClick={() => setShowTemplateUploader(false)}
                className="modal-close-btn"
              >
                ✅ Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptForm 