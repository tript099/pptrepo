import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './AdvancedEditor.css'

const AdvancedEditor = ({ slideData, onSave, onClose }) => {
  const [editedData, setEditedData] = useState(slideData)
  const [selectedSlide, setSelectedSlide] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const chartTypes = [
    { value: 'chart.column', label: 'Column Chart' },
    { value: 'chart.bar', label: 'Bar Chart' },
    { value: 'chart.pie', label: 'Pie Chart' },
    { value: 'chart.line', label: 'Line Chart' }
  ]

  const slideLayouts = [
    { value: 'title', label: 'Title Slide' },
    { value: 'bullets', label: 'Bullet Points' },
    { value: 'table', label: 'Table' },
    { value: 'chart.column', label: 'Chart' }
  ]

  const updateSlide = (slideIndex, field, value) => {
    const newData = { ...editedData }
    newData.slides[slideIndex][field] = value
    setEditedData(newData)
  }

  const updateSlideLayout = (slideIndex, newLayout) => {
    const newData = { ...editedData }
    const slide = newData.slides[slideIndex]
    
    // Reset slide content based on new layout
    if (newLayout === 'bullets') {
      slide.bullets = slide.bullets || ['New bullet point']
      delete slide.columns
      delete slide.rows
      delete slide.categories
      delete slide.series
    } else if (newLayout === 'table') {
      slide.columns = slide.columns || ['Column 1', 'Column 2']
      slide.rows = slide.rows || [['Data 1', 'Data 2']]
      delete slide.bullets
      delete slide.categories
      delete slide.series
    } else if (newLayout.startsWith('chart')) {
      slide.categories = slide.categories || ['Category 1', 'Category 2']
      slide.series = slide.series || { 'Series 1': [10, 20] }
      delete slide.bullets
      delete slide.columns
      delete slide.rows
    }
    
    slide.layout = newLayout
    setEditedData(newData)
  }

  const addBulletPoint = (slideIndex) => {
    const newData = { ...editedData }
    if (!newData.slides[slideIndex].bullets) {
      newData.slides[slideIndex].bullets = []
    }
    newData.slides[slideIndex].bullets.push('New bullet point')
    setEditedData(newData)
  }

  const removeBulletPoint = (slideIndex, bulletIndex) => {
    const newData = { ...editedData }
    newData.slides[slideIndex].bullets.splice(bulletIndex, 1)
    setEditedData(newData)
  }

  const addTableRow = (slideIndex) => {
    const newData = { ...editedData }
    const columns = newData.slides[slideIndex].columns || ['Col 1', 'Col 2']
    const newRow = new Array(columns.length).fill('New data')
    newData.slides[slideIndex].rows.push(newRow)
    setEditedData(newData)
  }

  const addSlide = () => {
    const newData = { ...editedData }
    newData.slides.push({
      layout: 'bullets',
      title: 'New Slide',
      bullets: ['New bullet point']
    })
    setEditedData(newData)
  }

  const deleteSlide = (slideIndex) => {
    if (editedData.slides.length <= 1) return
    const newData = { ...editedData }
    newData.slides.splice(slideIndex, 1)
    setEditedData(newData)
    if (selectedSlide >= newData.slides.length) {
      setSelectedSlide(newData.slides.length - 1)
    }
  }

  const generatePreview = async () => {
    setIsPreviewMode(true)
    try {
      const response = await axios.post('/api/preview', editedData, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'preview.pptx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Preview error:', error)
    }
    setIsPreviewMode(false)
  }

  const currentSlide = editedData.slides[selectedSlide]

  return (
    <div className="advanced-editor">
      <div className="editor-header">
        <h2>📝 Edit Presentation: {editedData.meta.deck_title}</h2>
        <div className="editor-actions">
          <button onClick={generatePreview} disabled={isPreviewMode} className="preview-btn">
            {isPreviewMode ? '🔄 Generating...' : '👁️ Preview'}
          </button>
          <button onClick={() => onSave(editedData)} className="save-btn">
            💾 Save Changes
          </button>
          <button onClick={onClose} className="close-btn">❌ Close</button>
        </div>
      </div>

      <div className="editor-content">
        {/* Slide Navigation */}
        <div className="slide-navigator">
          <div className="slides-header">
            <h3>📑 Slides ({editedData.slides.length})</h3>
            <button onClick={addSlide} className="add-slide-btn">➕ Add Slide</button>
          </div>
          
          <div className="slides-list">
            {editedData.slides.map((slide, index) => (
              <div
                key={index}
                className={`slide-item ${selectedSlide === index ? 'active' : ''}`}
                onClick={() => setSelectedSlide(index)}
              >
                <div className="slide-preview">
                  <span className="slide-number">{index + 1}</span>
                  <div className="slide-info">
                    <div className="slide-title">{slide.title}</div>
                    <div className="slide-layout">{slide.layout}</div>
                  </div>
                </div>
                {editedData.slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSlide(index)
                    }}
                    className="delete-slide-btn"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slide Editor */}
        <div className="slide-editor">
          <div className="slide-editor-header">
            <h3>✏️ Edit Slide {selectedSlide + 1}</h3>
            <select
              value={currentSlide.layout}
              onChange={(e) => updateSlideLayout(selectedSlide, e.target.value)}
              className="layout-selector"
            >
              {slideLayouts.map(layout => (
                <option key={layout.value} value={layout.value}>
                  {layout.label}
                </option>
              ))}
            </select>
          </div>

          <div className="slide-fields">
            {/* Title Field */}
            <div className="field-group">
              <label>📋 Slide Title</label>
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => updateSlide(selectedSlide, 'title', e.target.value)}
                className="field-input"
              />
            </div>

            {/* Subtitle for title slides */}
            {currentSlide.layout === 'title' && (
              <div className="field-group">
                <label>📝 Subtitle</label>
                <input
                  type="text"
                  value={currentSlide.subtitle || ''}
                  onChange={(e) => updateSlide(selectedSlide, 'subtitle', e.target.value)}
                  className="field-input"
                />
              </div>
            )}

            {/* Bullet Points */}
            {currentSlide.layout === 'bullets' && (
              <div className="field-group">
                <div className="bullets-header">
                  <label>🔸 Bullet Points</label>
                  <button onClick={() => addBulletPoint(selectedSlide)} className="add-btn">
                    ➕ Add Bullet
                  </button>
                </div>
                
                {(currentSlide.bullets || []).map((bullet, index) => (
                  <div key={index} className="bullet-editor">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...(currentSlide.bullets || [])]
                        newBullets[index] = e.target.value
                        updateSlide(selectedSlide, 'bullets', newBullets)
                      }}
                      className="bullet-input"
                    />
                    <button
                      onClick={() => removeBulletPoint(selectedSlide, index)}
                      className="remove-btn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Table Editor */}
            {currentSlide.layout === 'table' && (
              <div className="field-group">
                <label>📊 Table Data</label>
                
                {/* Column Headers */}
                <div className="table-headers">
                  <h4>Column Headers:</h4>
                  {(currentSlide.columns || []).map((column, index) => (
                    <input
                      key={index}
                      type="text"
                      value={column}
                      onChange={(e) => {
                        const newColumns = [...(currentSlide.columns || [])]
                        newColumns[index] = e.target.value
                        updateSlide(selectedSlide, 'columns', newColumns)
                      }}
                      className="table-header-input"
                    />
                  ))}
                </div>

                {/* Table Rows */}
                <div className="table-rows">
                  <div className="table-rows-header">
                    <h4>Table Rows:</h4>
                    <button onClick={() => addTableRow(selectedSlide)} className="add-btn">
                      ➕ Add Row
                    </button>
                  </div>
                  
                  {(currentSlide.rows || []).map((row, rowIndex) => (
                    <div key={rowIndex} className="table-row-editor">
                      {row.map((cell, cellIndex) => (
                        <input
                          key={cellIndex}
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...(currentSlide.rows || [])]
                            newRows[rowIndex][cellIndex] = e.target.value
                            updateSlide(selectedSlide, 'rows', newRows)
                          }}
                          className="table-cell-input"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

                                {/* Chart Editor */}
                    {currentSlide.layout && currentSlide.layout.startsWith('chart') && (
                      <div className="field-group">
                        <div className="chart-header">
                          <label>📈 Chart Data</label>
                          <select
                            value={currentSlide.layout}
                            onChange={(e) => updateSlide(selectedSlide, 'layout', e.target.value)}
                            className="chart-type-selector"
                          >
                            {chartTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Chart Categories */}
                        <div className="chart-categories">
                          <h4>Categories:</h4>
                          {(currentSlide.categories || []).map((category, index) => (
                            <input
                              key={index}
                              type="text"
                              value={category}
                              onChange={(e) => {
                                const newCategories = [...(currentSlide.categories || [])]
                                newCategories[index] = e.target.value
                                updateSlide(selectedSlide, 'categories', newCategories)
                              }}
                              className="chart-category-input"
                            />
                          ))}
                        </div>

                        {/* Chart Series */}
                        <div className="chart-series">
                          <h4>Data Series:</h4>
                          {Object.entries(currentSlide.series || {}).map(([seriesName, values]) => (
                            <div key={seriesName} className="series-editor">
                              <input
                                type="text"
                                value={seriesName}
                                onChange={(e) => {
                                  const newSeries = { ...currentSlide.series }
                                  delete newSeries[seriesName]
                                  newSeries[e.target.value] = values
                                  updateSlide(selectedSlide, 'series', newSeries)
                                }}
                                className="series-name-input"
                              />
                              <div className="series-values">
                                {values.map((value, index) => (
                                  <input
                                    key={index}
                                    type="number"
                                    value={value}
                                    onChange={(e) => {
                                      const newSeries = { ...currentSlide.series }
                                      newSeries[seriesName][index] = parseFloat(e.target.value) || 0
                                      updateSlide(selectedSlide, 'series', newSeries)
                                    }}
                                    className="series-value-input"
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text Boxes Editor - For ALL other text content */}
                    {currentSlide.text_boxes && currentSlide.text_boxes.length > 0 && (
                      <div className="field-group">
                        <div className="textboxes-header">
                          <label>📝 Additional Text Content</label>
                          <button 
                            onClick={() => {
                              const newData = { ...editedData }
                              if (!newData.slides[selectedSlide].text_boxes) {
                                newData.slides[selectedSlide].text_boxes = []
                              }
                              newData.slides[selectedSlide].text_boxes.push({
                                text: "New text box",
                                left: 100,
                                top: 100,
                                width: 200,
                                height: 50,
                                shape_id: `textbox_${newData.slides[selectedSlide].text_boxes.length}`
                              })
                              setEditedData(newData)
                            }} 
                            className="add-btn"
                          >
                            ➕ Add Text Box
                          </button>
                        </div>
                        
                        {currentSlide.text_boxes.map((textBox, index) => (
                          <div key={textBox.shape_id || index} className="textbox-editor">
                            <div className="textbox-header">
                              <span className="textbox-label">📄 Text Box {index + 1}</span>
                              {textBox.is_placeholder && (
                                <span className="placeholder-badge">
                                  Placeholder ({textBox.placeholder_type})
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  const newData = { ...editedData }
                                  newData.slides[selectedSlide].text_boxes.splice(index, 1)
                                  setEditedData(newData)
                                }}
                                className="remove-btn"
                              >
                                🗑️
                              </button>
                            </div>
                            
                            <textarea
                              value={textBox.text}
                              onChange={(e) => {
                                const newData = { ...editedData }
                                newData.slides[selectedSlide].text_boxes[index].text = e.target.value
                                setEditedData(newData)
                              }}
                              className="textbox-input"
                              rows="3"
                              placeholder="Enter text content..."
                            />
                            
                            {/* Position and Size Controls */}
                            <div className="textbox-properties">
                              <div className="property-group">
                                <label>Position & Size:</label>
                                <div className="position-inputs">
                                  <input
                                    type="number"
                                    value={Math.round((textBox.left || 0) / 12700)}
                                    onChange={(e) => {
                                      const newData = { ...editedData }
                                      newData.slides[selectedSlide].text_boxes[index].left = parseInt(e.target.value) * 12700
                                      setEditedData(newData)
                                    }}
                                    className="position-input"
                                    placeholder="X"
                                  />
                                  <input
                                    type="number"
                                    value={Math.round((textBox.top || 0) / 12700)}
                                    onChange={(e) => {
                                      const newData = { ...editedData }
                                      newData.slides[selectedSlide].text_boxes[index].top = parseInt(e.target.value) * 12700
                                      setEditedData(newData)
                                    }}
                                    className="position-input"
                                    placeholder="Y"
                                  />
                                  <input
                                    type="number"
                                    value={Math.round((textBox.width || 0) / 12700)}
                                    onChange={(e) => {
                                      const newData = { ...editedData }
                                      newData.slides[selectedSlide].text_boxes[index].width = parseInt(e.target.value) * 12700
                                      setEditedData(newData)
                                    }}
                                    className="size-input"
                                    placeholder="W"
                                  />
                                  <input
                                    type="number"
                                    value={Math.round((textBox.height || 0) / 12700)}
                                    onChange={(e) => {
                                      const newData = { ...editedData }
                                      newData.slides[selectedSlide].text_boxes[index].height = parseInt(e.target.value) * 12700
                                      setEditedData(newData)
                                    }}
                                    className="size-input"
                                    placeholder="H"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Formatting Information (read-only for now) */}
                            {(textBox.font_name || textBox.font_size || textBox.bold || textBox.italic) && (
                              <div className="textbox-formatting">
                                <small className="format-info">
                                  Original formatting: 
                                  {textBox.font_name && ` ${textBox.font_name}`}
                                  {textBox.font_size && ` ${textBox.font_size}pt`}
                                  {textBox.bold && ` Bold`}
                                  {textBox.italic && ` Italic`}
                                </small>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedEditor 