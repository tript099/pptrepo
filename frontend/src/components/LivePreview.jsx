import React, { useState } from 'react'
import './LivePreview.css'

const LivePreview = ({ previewData, onApplyEdits, isApplying }) => {
  const [selectedSlide, setSelectedSlide] = useState(0)

  if (!previewData || !previewData.slides) {
    return null
  }

  const currentSlide = previewData.slides[selectedSlide] || previewData.slides[0]

  const renderShapeContent = (shape) => {
    if (shape.type === 'text') {
      return (
        <div className="preview-text-element">
          <span className="shape-type">📝 Text</span>
          <div className="text-content">{shape.content}</div>
        </div>
      )
    }
    
    if (shape.type === 'table') {
      return (
        <div className="preview-table-element">
          <span className="shape-type">📊 Table</span>
          <div className="table-preview">
            {Array.isArray(shape.content) ? (
              <table>
                <tbody>
                  {shape.content.slice(0, 3).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.slice(0, 4).map((cell, cellIdx) => (
                        <td key={cellIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>{shape.content}</div>
            )}
          </div>
        </div>
      )
    }
    
    if (shape.type === 'chart') {
      return (
        <div className="preview-chart-element">
          <span className="shape-type">📈 Chart</span>
          <div className="chart-content">{shape.content}</div>
        </div>
      )
    }
    
    return (
      <div className="preview-other-element">
        <span className="shape-type">🔧 {shape.type}</span>
        <div className="other-content">{shape.content || 'Content'}</div>
      </div>
    )
  }

  const renderChanges = (changes) => {
    return changes.map((change, idx) => (
      <div key={idx} className={`change-item change-${change.action}`}>
        <div className="change-icon">
          {change.action === 'text_change' && '✏️'}
          {change.action === 'add_content' && '➕'}
          {change.action === 'unknown' && '❓'}
          {change.action === 'error' && '❌'}
        </div>
        <div className="change-details">
          <div className="change-description">{change.description}</div>
          {change.old_value && (
            <div className="change-values">
              <span className="old-value">"{change.old_value}"</span>
              <span className="arrow">→</span>
              <span className="new-value">"{change.new_value}"</span>
            </div>
          )}
          {change.action === 'add_content' && (
            <div className="new-content">
              <span className="new-value">+ {change.new_value}</span>
            </div>
          )}
        </div>
      </div>
    ))
  }

  return (
    <div className="live-preview">
      <div className="preview-header">
        <h3>🎬 Live Preview</h3>
        <div className="preview-stats">
          {previewData.total_slides} slides • {previewData.edit_summary.length} changes
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
              Slide {slide.slide_number}
              {slide.changes.length > 0 && <span className="change-indicator">•</span>}
            </button>
          ))}
        </div>
      )}

      {/* Edit Summary */}
      {previewData.edit_summary.length > 0 && (
        <div className="edit-summary">
          <h4>📋 Changes Summary</h4>
          <ul>
            {previewData.edit_summary.map((summary, idx) => (
              <li key={idx}>{summary}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Slide Preview */}
      <div className="slide-preview">
        <div className="slide-header">
          <h4>Slide {currentSlide.slide_number}</h4>
          {currentSlide.changes.length > 0 && (
            <span className="changes-count">{currentSlide.changes.length} changes</span>
          )}
        </div>

        {/* Original Content */}
        <div className="content-section">
          <h5>📄 Current Content</h5>
          <div className="original-content">
            {currentSlide.original_content.length > 0 ? (
              currentSlide.original_content.map((shape, idx) => (
                <div key={idx} className="content-item">
                  {renderShapeContent(shape)}
                </div>
              ))
            ) : (
              <div className="no-content">No content in this slide</div>
            )}
          </div>
        </div>

        {/* Changes */}
        {currentSlide.changes.length > 0 && (
          <div className="content-section">
            <h5>⚡ Planned Changes</h5>
            <div className="changes-content">
              {renderChanges(currentSlide.changes)}
            </div>
          </div>
        )}

        {/* No Changes */}
        {currentSlide.changes.length === 0 && (
          <div className="no-changes">
            <span>✓ No changes planned for this slide</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="preview-actions">
        <button 
          className="apply-edits-btn"
          onClick={onApplyEdits}
          disabled={isApplying}
        >
          {isApplying ? '⏳ Applying Changes...' : '✅ Apply All Changes'}
        </button>
        <div className="preview-note">
          ℹ️ Preview shows planned changes. Click "Apply" to download the edited presentation.
        </div>
      </div>
    </div>
  )
}

export default LivePreview
