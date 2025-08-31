import React, { useState, useEffect } from 'react'
import './SlideVisualPreview.css'

const SlideVisualPreview = ({ previewData, onApplyEdits, isApplying }) => {
  const [selectedSlide, setSelectedSlide] = useState(0)
  const [showChanges, setShowChanges] = useState(true)

  if (!previewData || !previewData.slides) {
    return null
  }

  const currentSlide = previewData.slides[selectedSlide] || previewData.slides[0]

  const renderSlideContent = (slide, showEdits = false) => {
    if (!slide || !slide.original_content) {
      return <div className="slide-canvas"><div className="slide-loading">Loading slide content...</div></div>
    }

    const content = showEdits ? applyChangesToContent(slide) : slide.original_content
    if (!Array.isArray(content)) {
      return <div className="slide-canvas"><div className="slide-error">Error loading content</div></div>
    }

    return (
      <div className="slide-canvas">
        <div className="slide-header-area">
          {content
            .filter(item => item && (item.is_title || (item.type === 'text' && item.shape_id === 0)))
            .slice(0, 1)
            .map((item, idx) => (
              <div 
                key={idx} 
                className={`slide-title ${getChangeStatus(item, slide.changes || [])}`}
              >
                {getDisplayText(item, slide.changes || [], showEdits)}
              </div>
            ))
          }
        </div>
        
        <div className="slide-content-area">
          {content
            .filter(item => item && !item.is_title && item.type === 'text')
            .map((item, idx) => (
              <div 
                key={idx} 
                className={`content-block ${getChangeStatus(item, slide.changes || [])}`}
              >
                {formatContentText(getDisplayText(item, slide.changes || [], showEdits))}
              </div>
            ))
          }
          
          {content
            .filter(item => item && item.type === 'table')
            .map((item, idx) => (
              <div key={idx} className={`table-block ${getChangeStatus(item, slide.changes || [])}`}>
                <div className="table-header">📊 Table</div>
                {renderTablePreview(item.table_data)}
              </div>
            ))
          }
          
          {content
            .filter(item => item && item.type === 'chart')
            .map((item, idx) => (
              <div key={idx} className={`chart-block ${getChangeStatus(item, slide.changes || [])}`}>
                <div className="chart-placeholder">
                  📈 Chart
                  <div className="chart-description">{item.content || 'Chart Element'}</div>
                </div>
              </div>
            ))
          }
          
          {/* Show new content being added */}
          {showEdits && slide.changes && Array.isArray(slide.changes) &&
            slide.changes
              .filter(change => change && change.action === 'add_content')
              .map((change, idx) => (
                <div key={`new-${idx}`} className="new-content-block">
                  <div className="new-content-label">➕ New: {change.type || 'Content'}</div>
                  <div className="new-content-preview">
                    {change.type === 'chart' && (
                      <div className="chart-placeholder new">
                        📈 {change.new_value || 'New Chart'}
                      </div>
                    )}
                    {change.type === 'table' && (
                      <div className="table-placeholder new">
                        📊 {change.new_value || 'New Table'}
                      </div>
                    )}
                    {(!change.type || change.type === 'text') && (
                      <div className="text-content new">
                        {change.new_value || 'New Text'}
                      </div>
                    )}
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    )
  }

  const getChangeStatus = (item, changes) => {
    if (!item || !changes || !Array.isArray(changes)) return ''
    
    const hasChange = changes.some(change => 
      change.shape_id === item.shape_id || 
      (change.old_value && item.text && item.text.includes(change.old_value)) ||
      (change.old_value && item.content && typeof item.content === 'string' && item.content.includes(change.old_value))
    )
    return hasChange ? 'has-changes' : ''
  }

  const getDisplayText = (item, changes, showEdits) => {
    if (!item) return ''
    if (!showEdits || !changes || !Array.isArray(changes)) {
      return item.text || item.content || ''
    }
    
    let text = item.text || item.content || ''
    if (typeof text !== 'string') return String(text)
    
    // Apply text changes
    changes.forEach(change => {
      if (change && change.action === 'text_change' && change.old_value && change.new_value) {
        if (text.includes(change.old_value)) {
          text = text.replace(change.old_value, change.new_value)
        }
      }
    })
    
    return text
  }

  const applyChangesToContent = (slide) => {
    // This would apply the changes to create a preview of the edited slide
    return slide.original_content
  }

  const formatContentText = (text) => {
    // Format bullet points and other text formatting
    if (!text) return ''
    
    return text.split('\n').map((line, idx) => (
      <div key={idx} className="content-line">
        {line.startsWith('•') || line.startsWith('-') ? (
          <div className="bullet-point">
            <span className="bullet">•</span>
            <span className="bullet-text">{line.replace(/^[•-]\s*/, '')}</span>
          </div>
        ) : (
          <div className="text-line">{line}</div>
        )}
      </div>
    ))
  }

  const renderTablePreview = (tableData) => {
    if (!Array.isArray(tableData)) return <div className="table-error">Preview unavailable</div>
    
    return (
      <table className="preview-table">
        <tbody>
          {tableData.slice(0, 4).map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.slice(0, 4).map((cell, cellIdx) => (
                <td key={cellIdx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="slide-visual-preview">
      <div className="preview-header">
        <h3>🎬 Live Slide Preview</h3>
        <div className="preview-controls">
          <button 
            className={`toggle-btn ${!showChanges ? 'active' : ''}`}
            onClick={() => setShowChanges(false)}
          >
            Original
          </button>
          <button 
            className={`toggle-btn ${showChanges ? 'active' : ''}`}
            onClick={() => setShowChanges(true)}
          >
            With Changes
          </button>
        </div>
      </div>

      {/* Slide Navigation */}
      {previewData.slides.length > 1 && (
        <div className="slide-navigation">
          {previewData.slides.map((slide, idx) => (
            <button
              key={idx}
              className={`slide-nav-btn ${selectedSlide === idx ? 'active' : ''}`}
              onClick={() => setSelectedSlide(idx)}
            >
              <div className="slide-mini-preview">
                <div className="mini-slide-number">{slide.slide_number}</div>
                {slide.changes.length > 0 && (
                  <div className="change-indicator">
                    {slide.changes.length} changes
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Slide Preview */}
      <div className="main-preview-area">
        <div className="slide-container">
          <div className="slide-frame">
            <div className="slide-number-badge">
              Slide {currentSlide.slide_number}
            </div>
            {renderSlideContent(currentSlide, showChanges)}
          </div>
        </div>

        {/* Changes Summary Sidebar */}
        <div className="changes-sidebar">
          <h4>📝 Changes Summary</h4>
          {currentSlide.changes.length > 0 ? (
            <div className="changes-list">
              {currentSlide.changes.map((change, idx) => (
                <div key={idx} className={`change-item change-${change.action}`}>
                  <div className="change-icon">
                    {change.action === 'text_change' && '✏️'}
                    {change.action === 'add_content' && '➕'}
                  </div>
                  <div className="change-details">
                    <div className="change-desc">{change.description}</div>
                    {change.old_value && change.new_value && (
                      <div className="change-diff">
                        <div className="old-text">"{change.old_value}"</div>
                        <div className="arrow">↓</div>
                        <div className="new-text">"{change.new_value}"</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-changes">
              ✓ No changes for this slide
            </div>
          )}
        </div>
      </div>

      {/* Apply Button */}
      <div className="preview-actions">
        <button 
          className="apply-edits-btn"
          onClick={onApplyEdits}
          disabled={isApplying}
        >
          {isApplying ? (
            <>
              <span className="spinner"></span>
              Applying Changes...
            </>
          ) : (
            <>
              ✅ Apply All Changes & Download
            </>
          )}
        </button>
        <div className="preview-note">
          Preview shows how your slides will look after editing. Click "Apply" to download the final presentation.
        </div>
      </div>
    </div>
  )
}

export default SlideVisualPreview
