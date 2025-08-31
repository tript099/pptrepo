import React, { useState } from 'react'
import './TemplateUploader.css'

const TemplateUploader = ({ onTemplateUpload, onLogoUpload, currentTemplate, currentLogo }) => {
  const [dragOver, setDragOver] = useState(false)
  const [uploadType, setUploadType] = useState('template') // 'template' or 'logo'

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    if (files.length === 0) return

    const file = files[0]
    
    if (uploadType === 'template') {
      // Validate template file (should be .pptx)
      if (!file.name.toLowerCase().endsWith('.pptx')) {
        alert('Please upload a PowerPoint template (.pptx file)')
        return
      }
      onTemplateUpload(file)
    } else {
      // Validate logo file (should be image)
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']
      if (!validImageTypes.includes(file.type)) {
        alert('Please upload a valid image file (PNG, JPG, GIF, SVG)')
        return
      }
      onLogoUpload(file)
    }
  }

  const logoPositions = [
    { value: 'top-right', label: '↗️ Top Right' },
    { value: 'top-left', label: '↖️ Top Left' },
    { value: 'bottom-right', label: '↘️ Bottom Right' },
    { value: 'bottom-left', label: '↙️ Bottom Left' },
    { value: 'center', label: '🎯 Center' }
  ]

  return (
    <div className="template-uploader">
      <div className="upload-tabs">
        <button
          className={`tab-btn ${uploadType === 'template' ? 'active' : ''}`}
          onClick={() => setUploadType('template')}
        >
          📄 Template
        </button>
        <button
          className={`tab-btn ${uploadType === 'logo' ? 'active' : ''}`}
          onClick={() => setUploadType('logo')}
        >
          🖼️ Logo
        </button>
      </div>

      {uploadType === 'template' && (
        <div className="upload-section">
          <h3>📄 Custom Template</h3>
          <p className="upload-description">
            Upload your own PowerPoint template (.pptx) to use as the base for generated presentations.
          </p>
          
          <div
            className={`upload-area ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <p><strong>Drag & drop your template here</strong></p>
                <p>or</p>
                <label className="file-input-label">
                  <input
                    type="file"
                    accept=".pptx"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                  <span className="file-input-button">Browse Files</span>
                </label>
              </div>
              <div className="upload-formats">
                Supported: .pptx files only
              </div>
            </div>
          </div>

          {currentTemplate && (
            <div className="current-file">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{currentTemplate.name}</span>
                <span className="file-size">
                  {(currentTemplate.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                onClick={() => onTemplateUpload(null)}
                className="remove-file-btn"
              >
                🗑️ Remove
              </button>
            </div>
          )}

          <div className="template-benefits">
            <h4>✨ Benefits of Custom Templates:</h4>
            <ul>
              <li>🎨 Your brand colors and fonts</li>
              <li>📐 Custom slide layouts</li>
              <li>🏢 Company branding elements</li>
              <li>📊 Pre-designed chart styles</li>
            </ul>
          </div>
        </div>
      )}

      {uploadType === 'logo' && (
        <div className="upload-section">
          <h3>🖼️ Company Logo</h3>
          <p className="upload-description">
            Upload your company logo to automatically add it to all slides.
          </p>

          <div
            className={`upload-area ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">🖼️</div>
              <div className="upload-text">
                <p><strong>Drag & drop your logo here</strong></p>
                <p>or</p>
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                  <span className="file-input-button">Browse Files</span>
                </label>
              </div>
              <div className="upload-formats">
                Supported: PNG, JPG, GIF, SVG
              </div>
            </div>
          </div>

          {currentLogo && (
            <div className="current-file">
              <div className="file-info">
                <span className="file-icon">🖼️</span>
                <span className="file-name">{currentLogo.name}</span>
                <span className="file-size">
                  {(currentLogo.size / 1024).toFixed(2)} KB
                </span>
              </div>
              <button
                onClick={() => onLogoUpload(null)}
                className="remove-file-btn"
              >
                🗑️ Remove
              </button>
            </div>
          )}

          <div className="logo-settings">
            <h4>📍 Logo Position:</h4>
            <div className="position-selector">
              {logoPositions.map(position => (
                <label key={position.value} className="position-option">
                  <input
                    type="radio"
                    name="logoPosition"
                    value={position.value}
                    defaultChecked={position.value === 'top-right'}
                  />
                  <span className="position-label">{position.label}</span>
                </label>
              ))}
            </div>

            <div className="logo-size">
              <label htmlFor="logoSize">📏 Logo Size:</label>
              <select id="logoSize" className="size-selector">
                <option value="small">Small (1 inch)</option>
                <option value="medium" selected>Medium (1.5 inches)</option>
                <option value="large">Large (2 inches)</option>
              </select>
            </div>
          </div>

          <div className="logo-preview">
            <h4>👁️ Preview Positions:</h4>
            <div className="preview-slide">
              <div className="preview-content">
                <div className="preview-title">Slide Title</div>
                <div className="preview-bullet">• Sample content</div>
                <div className="preview-bullet">• More content here</div>
              </div>
              <div className="logo-markers">
                <div className="logo-marker top-left">Logo</div>
                <div className="logo-marker top-right">Logo</div>
                <div className="logo-marker bottom-left">Logo</div>
                <div className="logo-marker bottom-right">Logo</div>
                <div className="logo-marker center">Logo</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateUploader 