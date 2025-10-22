import React from 'react';
import { Users } from 'lucide-react';
import './Tree.css';

const FamilyTree = () => {
  const family = {
    id: 1,
    name: 'John Smith',
    spouse: 'Mary Smith',
    color: 'grandparent',
    children: [
      {
        id: 2,
        name: 'Sarah Smith',
        spouse: 'James Johnson',
        color: 'parent',
        children: [
          { id: 10, name: 'Emma Johnson', color: 'child', children: [] },
          { id: 11, name: 'Noah Johnson', color: 'child', children: [] },
          { id: 12, name: 'Ava Johnson', color: 'child', children: [] }
        ]
      },
      {
        id: 3,
        name: 'Michael Smith',
        spouse: 'Jennifer Smith',
        color: 'parent',
        children: [
          { id: 13, name: 'Olivia Smith', color: 'child', children: [] },
          { id: 14, name: 'Liam Smith', color: 'child', children: [] },
          { id: 15, name: 'Sophia Smith', color: 'child', children: [] }
        ]
      },
      {
        id: 4,
        name: 'David Smith',
        spouse: 'Lisa Smith',
        color: 'parent',
        children: [
          { id: 16, name: 'Mason Smith', color: 'child', children: [] },
          { id: 17, name: 'Isabella Smith', color: 'child', children: [] },
          { id: 18, name: 'Ethan Smith', color: 'child', children: [] }
        ]
      },
      {
        id: 5,
        name: 'Emily Smith',
        spouse: 'Robert Brown',
        color: 'parent',
        children: [
          { id: 19, name: 'Mia Brown', color: 'child', children: [] },
          { id: 20, name: 'Lucas Brown', color: 'child', children: [] },
          { id: 21, name: 'Amelia Brown', color: 'child', children: [] }
        ]
      },
      {
        id: 6,
        name: 'Daniel Smith',
        spouse: 'Rachel Smith',
        color: 'parent',
        children: [
          { id: 22, name: 'Harper Smith', color: 'child', children: [] },
          { id: 23, name: 'Benjamin Smith', color: 'child', children: [] },
          { id: 24, name: 'Charlotte Smith', color: 'child', children: [] }
        ]
      }
    ]
  };

  const FamilyMember = ({ member, level = 0 }) => {
    const hasChildren = member.children && member.children.length > 0;
    const hasSpouse = member.spouse;

    return (
      <div className="family-member-container">
        {/* Member and Spouse */}
        <div className="member-wrapper">
          <div className="couple-container">
            {/* Main Member */}
            <div className="member-card">
              <div className={`member-circle ${member.color}`}>
                <Users size={32} />
              </div>
              <div className="member-name">{member.name}</div>
            </div>

            {/* Spouse if exists */}
            {hasSpouse && (
              <>
                <div className="spouse-connector"></div>
                <div className="member-card">
                  <div className={`member-circle ${member.color}`}>
                    <Users size={32} />
                  </div>
                  <div className="member-name">{member.spouse}</div>
                </div>
              </>
            )}
          </div>

          {/* Vertical line to children */}
          {hasChildren && (
            <div className={`vertical-line level-${level}`}></div>
          )}
        </div>

        {/* Children Container */}
        {hasChildren && (
          <div className="children-section">
            {/* Horizontal line connecting siblings */}
            {member.children.length > 1 && (
              <div 
                className="sibling-connector"
                style={{
                  width: `${(member.children.length - 1) * 180}px`
                }}
              ></div>
            )}
            
            {/* Children Grid */}
            <div className="children-grid">
              {member.children.map((child, idx) => (
                <div key={child.id} className="child-wrapper">
                  {/* Vertical line from sibling connector to child */}
                  <div className="child-connector-line"></div>
                  <FamilyMember member={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="header-section">
          <h1 className="main-title">Family Tree</h1>
          <p className="subtitle">Three Generation Family Genealogy</p>
        </div>

        {/* Legend */}
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

        {/* Family Tree */}
        <div className="tree-card">
          <FamilyMember member={family} />
        </div>

        {/* Footer Info */}
        {/* <div className="footer-info">
          <p>Circle colors: Blue (Grandparents) • Green (Parents & Spouses) • Purple (Grandchildren)</p>
        </div> */}
      </div>
    </div>
  );
};

export default FamilyTree;


