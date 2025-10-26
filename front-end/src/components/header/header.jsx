import React from 'react'
import './header.css'
const header = () => {
  return (
    <div className='header-top-top'>
        <div className="headermain">ಹೋಯಿಗೀಗದ್ದೆ ಕುಟುಂಬ ವೃಕ್ಷ ವಿವರಣೆ. 
      </div>
      <div className='instruction'>
            <div className="legend-card">
          <h3 className="legend-title">
            <div className="legend-icon"></div>
            Branch Colors Legend
          </h3>
          <div className="legend-grid">
            <div className="legend-item">
              <div className="legend-line parent-child-line"></div>
              <span>Parent to Children</span>
            </div>
            <div className="legend-item">
              <div className="legend-line sibling-line"></div>
              <span>Siblings Connection</span>
            </div>
            <div className="legend-item">
              <div className="legend-line grandchild-line"></div>
              <span>Children to Grandchildren</span>
            </div>
          </div>
         </div>
        </div>
    </div>
  )
}

export default header
