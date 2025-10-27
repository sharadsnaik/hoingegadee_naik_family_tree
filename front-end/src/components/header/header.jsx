import React from 'react';
import './header.css';

const Header = () => {
  return (
    <header className="header-top">
      <div className="headermain">
        ಹೋಯಿಗೀಗದ್ದೆ ಕುಟುಂಬ ವೃಕ್ಷ ವಿವರಣೆ.
      </div>
      <div className="instruction">
        <section className="legend-card" aria-label="Branch Colors Legend">
          <h3 className="legend-title">
            <span className="legend-icon" aria-hidden="true"></span>
            Branch Colors Legend
          </h3>
          <div className="legend-grid">
            <div className="legend-item">
              <span className="legend-line parent-child-line" aria-hidden="true"></span>
              <span>Parent to Children</span>
            </div>
            <div className="legend-item">
              <span className="legend-line sibling-line" aria-hidden="true"></span>
              <span>Siblings Connection</span>
            </div>
            <div className="legend-item">
              <span className="legend-line grandchild-line" aria-hidden="true"></span>
              <span>Children to Grandchildren</span>
            </div>
          </div>
        </section>
      </div>
    </header>
  );
};

export default Header;