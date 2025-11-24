import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, X, Trash2 } from 'lucide-react';
import './FamilyTree.css';

const FamilyTree = () => {
  // const main_url = 'http://127.0.0.1:8000'
  const main_url = 'https://hoingegadee-naik-family-tree-1.onrender.com'
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  
  const containerRef = useRef(null);
  const treeRef = useRef(null);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  useEffect(() => {
    if (familyData.length > 0 && containerRef.current && treeRef.current) {
      setTimeout(() => {
        const container = containerRef.current;
        const tree = treeRef.current;
        const containerRect = container.getBoundingClientRect();
        const treeRect = tree.getBoundingClientRect();
        
        setPosition({
          x: (containerRect.width - treeRect.width * scale) / 2,
          y: 50
        });
      }, 100);
    }
  }, [familyData, scale]);

  const fetchFamilyData = async () => {
    try {
      const response = await fetch(`${main_url}/fetch`);
      if (!response.ok) throw new Error('Failed to fetch family data');
      const data = await response.json();
      setFamilyData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeletePerson = async (uniqId) => {
    if (!window.confirm(`Are you sure you want to delete this person?\n\nUnique ID: ${uniqId}\n\nThis action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // const response = await fetch(`https://127.0.0.1:8000/${uniqId}`, {
      const response = await fetch(`${main_url}/delete/uniq${uniqId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete person');
      }

      // Close modal and refresh data
      setSelectedPerson(null);
      await fetchFamilyData();
      
      alert('Person deleted successfully!');
    } catch (err) {
      alert(`Error deleting person: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const findPersonByUniqId = (uniqId) => {
    return familyData.find(p => p.uniq_id === uniqId);
  };

  const findRootAncestors = () => {
    const roots = [];
    const allChildren = new Set();
    
    familyData.forEach(person => {
      if (person.children) {
        person.children.forEach(child => {
          allChildren.add(child.uniq_id);
        });
      }
    });
    
    familyData.forEach(person => {
      if (!allChildren.has(person.uniq_id)) {
        roots.push(person);
      }
    });
    
    return roots.length > 0 ? roots : familyData.slice(0, 1);
  };

  const getChildren = (person) => {
    if (!person.children || person.children.length === 0) return [];
    return person.children
      .map(child => findPersonByUniqId(child.uniq_id))
      .filter(Boolean);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.person-circle') || e.target.closest('.modal-overlay')) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    requestAnimationFrame(() => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(0.1, scale + delta), 3);
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scaleChange = newScale / scale;
    setPosition({
      x: mouseX - (mouseX - position.x) * scaleChange,
      y: mouseY - (mouseY - position.y) * scaleChange
    });
    
    setScale(newScale);
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

const handleTouchStart = (e) => {
    // Only prevent dragging if touching the clickable person circle or modal
    if (e.target.closest('.person-circle') || e.target.closest('.modal-overlay')) {
      return;
    }
    
    // Prevent default to stop scrolling
    e.preventDefault();
    
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e) => {
    if (e.target.closest('.modal-overlay')) return;
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
      requestAnimationFrame(() => {
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y
        });
      });
    } else if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = center.x - rect.left;
      const centerY = center.y - rect.top;
      
      const scaleDelta = currentDistance / lastTouchDistance;
      const newScale = Math.min(Math.max(0.1, scale * scaleDelta), 3);
      
      const scaleChange = newScale / scale;
      requestAnimationFrame(() => {
        setPosition({
          x: centerX - (centerX - position.x) * scaleChange,
          y: centerY - (centerY - position.y) * scaleChange
        });
        setScale(newScale);
      });
      setLastTouchDistance(currentDistance);
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(0);
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  const PersonNode = ({ person, generation = 0 }) => {
    const children = getChildren(person);
    const hasSpouse = person.wife_name && person.wife_name.trim() !== '';

    return (
      <div className="tree-node">
        <div className="couple-container">
          <div className="node-content">
            <div 
              className="person-circle"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPerson(person);
              }}
            >
              <div className="circle-avatar">
                {person.image_url ? (
                  <img src={person.image_url} alt={person.name} />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div className="person-name-label">{person.name}</div>
              <div className="person-id-label">{person.uniq_id}</div>
            </div>

            {hasSpouse && (
              <>
                <div className="marriage-line">
                  <div className="marriage-heart">♥</div>
                </div>
                <div className="person-circle spouse">
                  <div className="circle-avatar spouse-avatar">
                    {person.spouse_image ? (
                  <img src={person.spouse_image} alt={person.name} />
                ) : (
                  <User size={32} />
                )}
                  </div>
                  <div className="person-name-label">{person.wife_name}</div>
                  <div className="spouse-label">Spouse</div>
                </div>
              </>
            )}
          </div>

          {children.length > 0 && (
            <div className="connector-line-down"></div>
          )}
        </div>

        {children.length > 0 && (
          <>
            <div className="children-connector">
              {children.length === 1 ? (
                <div className="single-child-line"></div>
              ) : (
                <>
                  <div className="horizontal-connector-line"></div>
                  {children.map((child, index) => (
                    <div 
                      key={`connector-${child.uniq_id || index}`}
                      className="child-vertical-connector"
                      style={{
                        left: `${(100 / (children.length + 1)) * (index + 1)}%`
                      }}
                    ></div>
                  ))}
                </>
              )}
            </div>
            
            <div className="children-row">
              {children.map((child, index) => (
                <div key={child.uniq_id || index} className="child-wrapper">
                  <PersonNode person={child} generation={generation + 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading family tree...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchFamilyData}>Retry</button>
      </div>
    );
  }

  const roots = findRootAncestors();

  return (
    <div className="family-tree-app">
      <header className="app-header">
        <h1>Family Tree</h1>
        <p>{familyData.length} family members · Pinch to zoom</p>
      </header>

      <div 
        className="tree-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="tree-wrapper"
          ref={treeRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {roots.map(root => (
            <PersonNode key={root.uniq_id} person={root} generation={0} />
          ))}
        </div>
      </div>

      {selectedPerson && (
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPerson(null)}>
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <div className="modal-avatar">
                {selectedPerson.image_url ? (
                  <img src={selectedPerson.image_url} alt={selectedPerson.name} />
                ) : (
                  <User size={48} />
                )}
              </div>
              <div>
                <h2>{selectedPerson.name}</h2>
                <p className="modal-id">{selectedPerson.uniq_id}</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h3>Family Information</h3>
                <div className="info-grid">
                  {selectedPerson.father_name && (
                    <div className="info-item">
                      <strong>Father</strong>
                      <span>{selectedPerson.father_name}</span>
                    </div>
                  )}
                  {selectedPerson.mother_name && (
                    <div className="info-item">
                      <strong>Mother</strong>
                      <span>{selectedPerson.mother_name}</span>
                    </div>
                  )}
                  {selectedPerson.wife_name && (
                    <div className="info-item">
                      <strong>Spouse</strong>
                      <span>{selectedPerson.wife_name}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <strong>Children</strong>
                    <span>{selectedPerson.children?.length || 0}</span>
                  </div>
                </div>
              </div>

              {(selectedPerson.Phone_number || selectedPerson.adress) && (
                <div className="info-section">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    {selectedPerson.Phone_number && (
                      <div className="info-item">
                        <Phone size={18} />
                        <span>{selectedPerson.Phone_number}</span>
                      </div>
                    )}
                    {selectedPerson.adress && (
                      <div className="info-item">
                        <MapPin size={18} />
                        <span>{selectedPerson.adress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPerson.children && selectedPerson.children.length > 0 && (
                <div className="info-section">
                  <h3>Children ({selectedPerson.children.length})</h3>
                  <div className="children-list">
                    {selectedPerson.children.map((child, index) => (
                      <div key={index} className="child-item">
                        {child.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="delete-section">
                <button 
                  className="delete-btn"
                  onClick={() => handleDeletePerson(selectedPerson.uniq_id)}
                  disabled={isDeleting}
                >
                  <Trash2 size={20} />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Person'}</span>
                </button>
                <p className="delete-warning">
                  ⚠️ This action will permanently delete this person from the family tree
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTree;
























// VERSION 1

// import React, { useState, useEffect, useRef } from 'react';
// import { User, Phone, MapPin, X } from 'lucide-react';
// import './FamilyTree.css';

// const FamilyTree = () => {
//   const [familyData, setFamilyData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedPerson, setSelectedPerson] = useState(null);
  
//   const [scale, setScale] = useState(1);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [lastTouchDistance, setLastTouchDistance] = useState(0);
  
//   const containerRef = useRef(null);
//   const treeRef = useRef(null);

//   useEffect(() => {
//     fetchFamilyData();
//   }, []);

//   useEffect(() => {
//     if (familyData.length > 0 && containerRef.current && treeRef.current) {
//       setTimeout(() => {
//         const container = containerRef.current;
//         const tree = treeRef.current;
//         const containerRect = container.getBoundingClientRect();
//         const treeRect = tree.getBoundingClientRect();
        
//         setPosition({
//           x: (containerRect.width - treeRect.width * scale) / 2,
//           y: 50
//         });
//       }, 100);
//     }
//   }, [familyData, scale]);

//   const fetchFamilyData = async () => {
//     try {
//       const response = await fetch('http://127.0.0.1:8000/fetch');
//       if (!response.ok) throw new Error('Failed to fetch family data');
//       const data = await response.json();
//       setFamilyData(data);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   const findPersonByUniqId = (uniqId) => {
//     return familyData.find(p => p.uniq_id === uniqId);
//   };

//   const findRootAncestors = () => {
//     const roots = [];
//     const allChildren = new Set();
    
//     familyData.forEach(person => {
//       if (person.children) {
//         person.children.forEach(child => {
//           allChildren.add(child.uniq_id);
//         });
//       }
//     });
    
//     familyData.forEach(person => {
//       if (!allChildren.has(person.uniq_id)) {
//         roots.push(person);
//       }
//     });
    
//     return roots.length > 0 ? roots : familyData.slice(0, 1);
//   };

//   const getChildren = (person) => {
//     if (!person.children || person.children.length === 0) return [];
//     return person.children
//       .map(child => findPersonByUniqId(child.uniq_id))
//       .filter(Boolean);
//   };

//   const handleMouseDown = (e) => {
//     if (e.target.closest('.person-circle') || e.target.closest('.modal-overlay')) return;
//     e.preventDefault();
//     setIsDragging(true);
//     setDragStart({
//       x: e.clientX - position.x,
//       y: e.clientY - position.y
//     });
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     requestAnimationFrame(() => {
//       setPosition({
//         x: e.clientX - dragStart.x,
//         y: e.clientY - dragStart.y
//       });
//     });
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   const handleWheel = (e) => {
//     e.preventDefault();
//     const delta = e.deltaY * -0.002;
//     const newScale = Math.min(Math.max(0.1, scale + delta), 3);
    
//     const rect = containerRef.current.getBoundingClientRect();
//     const mouseX = e.clientX - rect.left;
//     const mouseY = e.clientY - rect.top;
    
//     const scaleChange = newScale / scale;
//     setPosition({
//       x: mouseX - (mouseX - position.x) * scaleChange,
//       y: mouseY - (mouseY - position.y) * scaleChange
//     });
    
//     setScale(newScale);
//   };

//   const getTouchDistance = (touches) => {
//     const dx = touches[0].clientX - touches[1].clientX;
//     const dy = touches[0].clientY - touches[1].clientY;
//     return Math.sqrt(dx * dx + dy * dy);
//   };

//   const getTouchCenter = (touches) => {
//     return {
//       x: (touches[0].clientX + touches[1].clientX) / 2,
//       y: (touches[0].clientY + touches[1].clientY) / 2
//     };
//   };

//   const handleTouchStart = (e) => {
//     if (e.target.closest('.person-circle') || e.target.closest('.modal-overlay')) return;
    
//     if (e.touches.length === 1) {
//       setIsDragging(true);
//       setDragStart({
//         x: e.touches[0].clientX - position.x,
//         y: e.touches[0].clientY - position.y
//       });
//     } else if (e.touches.length === 2) {
//       setIsDragging(false);
//       setLastTouchDistance(getTouchDistance(e.touches));
//     }
//   };

//   const handleTouchMove = (e) => {
//     if (e.target.closest('.modal-overlay')) return;
//     e.preventDefault();
    
//     if (e.touches.length === 1 && isDragging) {
//       requestAnimationFrame(() => {
//         setPosition({
//           x: e.touches[0].clientX - dragStart.x,
//           y: e.touches[0].clientY - dragStart.y
//         });
//       });
//     } else if (e.touches.length === 2) {
//       const currentDistance = getTouchDistance(e.touches);
//       const center = getTouchCenter(e.touches);
//       const rect = containerRef.current.getBoundingClientRect();
//       const centerX = center.x - rect.left;
//       const centerY = center.y - rect.top;
      
//       const scaleDelta = currentDistance / lastTouchDistance;
//       const newScale = Math.min(Math.max(0.1, scale * scaleDelta), 3);
      
//       const scaleChange = newScale / scale;
//       requestAnimationFrame(() => {
//         setPosition({
//           x: centerX - (centerX - position.x) * scaleChange,
//           y: centerY - (centerY - position.y) * scaleChange
//         });
//         setScale(newScale);
//       });
//       setLastTouchDistance(currentDistance);
//     }
//   };

//   const handleTouchEnd = (e) => {
//     if (e.touches.length < 2) {
//       setLastTouchDistance(0);
//     }
//     if (e.touches.length === 0) {
//       setIsDragging(false);
//     }
//   };

//   const PersonNode = ({ person, generation = 0 }) => {
//     const children = getChildren(person);
//     const hasSpouse = person.wife_name && person.wife_name.trim() !== '';

//     return (
//       <div className="tree-node">
//         <div className="couple-container">
//           <div className="node-content">
//             <div 
//               className="person-circle"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedPerson(person);
//               }}
//             >
//               <div className="circle-avatar">
//                 {person.image_url ? (
//                   <img src={person.image_url} alt={person.name} />
//                 ) : (
//                   <User size={32} />
//                 )}
//               </div>
//               <div className="person-name-label">{person.name}</div>
//               <div className="person-id-label">{person.uniq_id}</div>
//             </div>

//             {hasSpouse && (
//               <>
//                 <div className="marriage-line">
//                   <div className="marriage-heart">♥</div>
//                 </div>
//                 <div className="person-circle spouse">
//                   <div className="circle-avatar spouse-avatar">
//                     <User size={32} />
//                   </div>
//                   <div className="person-name-label">{person.wife_name}</div>
//                   <div className="spouse-label">Spouse</div>
//                 </div>
//               </>
//             )}
//           </div>

//           {children.length > 0 && (
//             <div className="connector-line-down"></div>
//           )}
//         </div>

//         {children.length > 0 && (
//           <>
//             <div className="children-connector">
//               {children.length === 1 ? (
//                 <div className="single-child-line"></div>
//               ) : (
//                 <>
//                   <div className="horizontal-connector-line"></div>
//                   {children.map((child, index) => (
//                     <div 
//                       key={`connector-${child.uniq_id || index}`}
//                       className="child-vertical-connector"
//                       style={{
//                         left: `${(100 / (children.length + 1)) * (index + 1)}%`
//                       }}
//                     ></div>
//                   ))}
//                 </>
//               )}
//             </div>
            
//             <div className="children-row">
//               {children.map((child, index) => (
//                 <div key={child.uniq_id || index} className="child-wrapper">
//                   <PersonNode person={child} generation={generation + 1} />
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p>Loading family tree...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <p>Error: {error}</p>
//         <button onClick={fetchFamilyData}>Retry</button>
//       </div>
//     );
//   }

//   const roots = findRootAncestors();

//   return (
//     <div className="family-tree-app">
//       <header className="app-header">
//         <h1>Family Tree</h1>
//         <p>{familyData.length} family members · Pinch to zoom</p>
//       </header>

//       <div 
//         className="tree-container"
//         ref={containerRef}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}
//         onWheel={handleWheel}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         <div 
//           className="tree-wrapper"
//           ref={treeRef}
//           style={{
//             transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
//             transformOrigin: '0 0'
//           }}
//         >
//           {roots.map(root => (
//             <PersonNode key={root.uniq_id} person={root} generation={0} />
//           ))}
//         </div>
//       </div>

//       {selectedPerson && (
//         <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <button className="modal-close" onClick={() => setSelectedPerson(null)}>
//               <X size={24} />
//             </button>
            
//             <div className="modal-header">
//               <div className="modal-avatar">
//                 {selectedPerson.image_url ? (
//                   <img src={selectedPerson.image_url} alt={selectedPerson.name} />
//                 ) : (
//                   <User size={48} />
//                 )}
//               </div>
//               <div>
//                 <h2>{selectedPerson.name}</h2>
//                 <p className="modal-id">{selectedPerson.uniq_id}</p>
//               </div>
//             </div>

//             <div className="modal-body">
//               <div className="info-section">
//                 <h3>Family Information</h3>
//                 <div className="info-grid">
//                   {selectedPerson.father_name && (
//                     <div className="info-item">
//                       <strong>Father</strong>
//                       <span>{selectedPerson.father_name}</span>
//                     </div>
//                   )}
//                   {selectedPerson.mother_name && (
//                     <div className="info-item">
//                       <strong>Mother</strong>
//                       <span>{selectedPerson.mother_name}</span>
//                     </div>
//                   )}
//                   {selectedPerson.wife_name && (
//                     <div className="info-item">
//                       <strong>Spouse</strong>
//                       <span>{selectedPerson.wife_name}</span>
//                     </div>
//                   )}
//                   <div className="info-item">
//                     <strong>Children</strong>
//                     <span>{selectedPerson.children?.length || 0}</span>
//                   </div>
//                 </div>
//               </div>

//               {(selectedPerson.Phone_number || selectedPerson.adress) && (
//                 <div className="info-section">
//                   <h3>Contact Information</h3>
//                   <div className="info-grid">
//                     {selectedPerson.Phone_number && (
//                       <div className="info-item">
//                         <Phone size={18} />
//                         <span>{selectedPerson.Phone_number}</span>
//                       </div>
//                     )}
//                     {selectedPerson.adress && (
//                       <div className="info-item">
//                         <MapPin size={18} />
//                         <span>{selectedPerson.adress}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {selectedPerson.children && selectedPerson.children.length > 0 && (
//                 <div className="info-section">
//                   <h3>Children ({selectedPerson.children.length})</h3>
//                   <div className="children-list">
//                     {selectedPerson.children.map((child, index) => (
//                       <div key={index} className="child-item">
//                         {child.name}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FamilyTree;












// ANOTHER OPTION 

 
// import React, { useState, useEffect, useRef } from 'react';
// import './FamilyTree.css';

// const FamilyTree = () => {
//   const [allPeople, setAllPeople] = useState([]);
//   const [selectedPerson, setSelectedPerson] = useState(null);
//   const [scale, setScale] = useState(1);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [loading, setLoading] = useState(true);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     fetchFamilyData();
//   }, []);

//   const fetchFamilyData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('http://127.0.0.1:8000/fetch');
//       const data = await response.json();
      
//       if (data && data.length > 0) {
//         setAllPeople(data);
//       }
//     } catch (error) {
//       console.error('Error fetching family data:', error);
//       alert('Failed to fetch family data. Please check if the API is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const findPersonByUniqId = (uniqId) => {
//     return allPeople.find(p => p.uniq_id === uniqId);
//   };

//   const findPersonByName = (name) => {
//     return allPeople.find(p => p.name === name);
//   };

//   const getGenerations = () => {
//     if (!allPeople.length) return [];

//     // Create a map to track who is a child
//     const isChild = new Set();
//     allPeople.forEach(person => {
//       if (person.children && person.children.length > 0) {
//         person.children.forEach(child => {
//           isChild.add(child.uniq_id);
//         });
//       }
//     });

//     // Find root generation (people who are not children)
//     const roots = allPeople.filter(person => !isChild.has(person.uniq_id));

//     // Build generations recursively
//     const generations = [];
//     const visited = new Set();

//     const buildGeneration = (people, level) => {
//       if (!people || people.length === 0) return;

//       if (!generations[level]) {
//         generations[level] = [];
//       }

//       people.forEach(person => {
//         if (visited.has(person.uniq_id)) return;
//         visited.add(person.uniq_id);

//         generations[level].push(person);

//         // Add children to next generation
//         if (person.children && person.children.length > 0) {
//           const childrenData = person.children
//             .map(child => findPersonByUniqId(child.uniq_id))
//             .filter(c => c !== undefined);
          
//           buildGeneration(childrenData, level + 1);
//         }
//       });
//     };

//     buildGeneration(roots, 0);
//     return generations;
//   };

//   const handleWheel = (e) => {
//     e.preventDefault();
//     const delta = e.deltaY * -0.001;
//     const newScale = Math.min(Math.max(0.5, scale + delta), 3);
//     setScale(newScale);
//   };

//   const handleMouseDown = (e) => {
//     if (e.target.closest('.person-card')) return;
//     setIsDragging(true);
//     setDragStart({
//       x: e.clientX - position.x,
//       y: e.clientY - position.y
//     });
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging) return;
//     setPosition({
//       x: e.clientX - dragStart.x,
//       y: e.clientY - dragStart.y
//     });
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   const handleTouchStart = (e) => {
//     if (e.target.closest('.person-card')) return;
//     if (e.touches.length === 1) {
//       setIsDragging(true);
//       setDragStart({
//         x: e.touches[0].clientX - position.x,
//         y: e.touches[0].clientY - position.y
//       });
//     }
//   };

//   const handleTouchMove = (e) => {
//     if (!isDragging || e.touches.length !== 1) return;
//     e.preventDefault();
//     setPosition({
//       x: e.touches[0].clientX - dragStart.x,
//       y: e.touches[0].clientY - dragStart.y
//     });
//   };

//   const handleTouchEnd = () => {
//     setIsDragging(false);
//   };

//   const renderPerson = (person) => {
//     const spouse = person.wife_name ? findPersonByName(person.wife_name) : null;

//     return (
//       <div className="person-group" key={person.uniq_id}>
//         <div className="person-card" onClick={() => setSelectedPerson(person)}>
//           <div className="person-image">
//             <img src={person.image_url} alt={person.name} />
//           </div>
//           <div className="person-name">{person.name}</div>
//         </div>
        
//         {spouse && (
//           <>
//             <div className="spouse-connector">
//               <div className="heart-icon">❤</div>
//             </div>
//             <div className="person-card spouse-card" onClick={() => setSelectedPerson(spouse)}>
//               <div className="person-image">
//                 <img src={spouse.image_url} alt={spouse.name} />
//               </div>
//               <div className="person-name">{spouse.name}</div>
//             </div>
//           </>
//         )}
//       </div>
//     );
//   };

//   const generations = getGenerations();

//   if (loading) {
//     return (
//       <div className="family-tree-app">
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading Family Tree...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="family-tree-app">
//       <div className="header">
//         <h1>Family Tree</h1>
//         <div className="controls">
//           <button onClick={() => setScale(Math.min(scale + 0.2, 3))}>+</button>
//           <span>{Math.round(scale * 100)}%</span>
//           <button onClick={() => setScale(Math.max(scale - 0.2, 0.5))}>-</button>
//           <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}>Reset</button>
//         </div>
//       </div>

//       <div
//         className="tree-container"
//         ref={containerRef}
//         onWheel={handleWheel}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         <div
//           className="tree-content"
//           style={{
//             transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
//           }}
//         >
//           {generations.length > 0 ? (
//             <div className="tree-structure">
//               {generations.map((generation, genIndex) => (
//                 <div key={genIndex} className="generation">
//                   {genIndex > 0 && (
//                     <div className="generation-connector">
//                       <div className="connector-line"></div>
//                     </div>
//                   )}
//                   <div className="generation-row">
//                     {generation.map((person) => (
//                       <div key={person.uniq_id} className="person-branch">
//                         {genIndex > 0 && <div className="branch-line"></div>}
//                         {renderPerson(person)}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="no-data">
//               <p>No family data available</p>
//               <button onClick={fetchFamilyData}>Retry</button>
//             </div>
//           )}
//         </div>
//       </div>

//       {selectedPerson && (
//         <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <button className="close-btn" onClick={() => setSelectedPerson(null)}>×</button>
//             <div className="modal-image">
//               <img src={selectedPerson.image_url} alt={selectedPerson.name} />
//             </div>
//             <h2>{selectedPerson.name}</h2>
//             <div className="modal-details">
//               {selectedPerson.father_name && (
//                 <div className="detail-row">
//                   <span className="label">Father:</span>
//                   <span className="value">{selectedPerson.father_name}</span>
//                 </div>
//               )}
//               {selectedPerson.mother_name && (
//                 <div className="detail-row">
//                   <span className="label">Mother:</span>
//                   <span className="value">{selectedPerson.mother_name}</span>
//                 </div>
//               )}
//               {selectedPerson.wife_name && (
//                 <div className="detail-row">
//                   <span className="label">Spouse:</span>
//                   <span className="value">{selectedPerson.wife_name}</span>
//                 </div>
//               )}
//               {selectedPerson.Phone_number && (
//                 <div className="detail-row">
//                   <span className="label">Phone:</span>
//                   <span className="value">{selectedPerson.Phone_number}</span>
//                 </div>
//               )}
//               {selectedPerson.adress && (
//                 <div className="detail-row">
//                   <span className="label">Address:</span>
//                   <span className="value">{selectedPerson.adress}</span>
//                 </div>
//               )}
//               {selectedPerson.children && selectedPerson.children.length > 0 && (
//                 <div className="detail-row">
//                   <span className="label">Children:</span>
//                   <span className="value">
//                     {selectedPerson.~children.map(c => c.name).join(', ')}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FamilyTree;






// latest vsersoon
import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, X, Trash2 } from 'lucide-react';
import './FamilyTree.css';
import '../../App.css'

const FamilyTree = () => {
  // const main_url = process.env.REACT_APP_BACKEND_URL;

  const main_url = 'http://127.0.0.1:8000'
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [scale, setScale] = useState(0.4);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [isTouchMoving, setIsTouchMoving] = useState(false);
  
  const containerRef = useRef(null);
  const treeRef = useRef(null);
const [isRefreshing, setIsRefreshing] = useState(false);
const [selectedSpouse, setSelectedSpouse] = useState(null);

const [isKannada, setIsKannada] = useState(false);
const [loadingMessage, setLoadingMessage] = useState("");

useEffect(() => {
  // Initial fetch when component mounts
  fetchFamilyData();
  
  // Define the event handler function
  const handlePersonAdded = (event) => {
    console.log('🔔 Person added event received!');
    
    // Optional: If you passed data with the event
    if (event.detail?.newPerson) {
      console.log('New person data:', event.detail.newPerson);
    }
    
    // Refresh the tree
    console.log('♻️ Refreshing family tree...');
    fetchFamilyData(true);
  };
  
  // Add event listener
  window.addEventListener('personAdded', handlePersonAdded);
  
  // Cleanup function - removes listener when component unmounts
  return () => {
    console.log('🧹 Cleaning up personAdded event listener');
    window.removeEventListener('personAdded', handlePersonAdded);
  };
}, []); // Empty dependency array = runs once on mount`


  useEffect(() => {
    if (familyData.length > 0 && containerRef.current && treeRef.current) {
      setTimeout(() => {
        const container = containerRef.current;
        const tree = treeRef.current;
        const containerRect = container.getBoundingClientRect();
        const treeRect = tree.getBoundingClientRect();
        
        setPosition({
          x: (containerRect.width - treeRect.width * scale) / 2,
          y: 50
        });
      }, 100);
    }
  }, [familyData, scale]);

  // Useeffect for saving And laoding transalted data form system local 
 useEffect(() => {
  const savedLang = localStorage.getItem("languagePreference");
  const isKn = savedLang === "kn";
  const endpoint = isKn ? "/translate" : "/fetch";

  (async () => {
    try {
      setLoading(true);
      const res = await fetch(`${main_url}${endpoint}`);
      const data = await res.json();
      setFamilyData(data);
      setIsKannada(isKn);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  })();
}, [isKannada]);  
  const fetchFamilyData = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh){
        setIsRefreshing(true)
      }else{
        setLoading(true)
      }
      const response = await fetch(`${main_url}/fetch`);
      if (!response.ok) throw new Error('Failed to fetch family data');
      const data = await response.json();
      setFamilyData(data);

      if (isAutoRefresh){
        console.log('Tree Refreshed')
      }}
      catch(err){
        setError(err.message);
      }
      finally{
      setLoading(false);
      setLoading(false);
    }
  };

  const findPersonByUniqId = (uniqId) => {
    return familyData.find(p => p.uniq_id === uniqId);
  };

const findRootAncestors = () => {
  const childSet = new Set();

  // Collect all uniq_ids that appear as children
  familyData.forEach(p => {
    if (p.children) {
      p.children.forEach(c => {
        if (c.uniq_id) childSet.add(c.uniq_id);
      });
    }
  });

  // Root = anyone NOT in childSet
  const roots = familyData.filter(p => !childSet.has(p.uniq_id));

  // Fallback: if no roots found, show everyone as root
  if (roots.length === 0) return familyData;

  return roots;
};


const getChildren = (person) => {
  if (!person.children || person.children.length === 0) return [];
  
  // Deduplicate by uniq_id using a Map (preserves insertion order)
  const uniqueChildren = [...new Map(person.children.map(c => [c.uniq_id, c])).values()];
  
  return uniqueChildren
    .map(child => familyData.find(p => p.uniq_id === child.uniq_id))
    .filter(Boolean);  // Remove undefined (missing from familyData)
};


  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.modal-overlay')) return;
    
    // console.log('Touch start:', e.touches.length, 'touches');
    
    if (e.touches.length === 1) {
      setTouchStartPos({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        posX: position.x,
        posY: position.y
      });
      setIsTouchMoving(false);
    } else if (e.touches.length === 2) {
      setTouchStartPos(null);
      setIsTouchMoving(false);
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e) => {
    if (e.target.closest('.modal-overlay')) return;
    
    if (e.touches.length === 1 && touchStartPos) {
      const moveX = e.touches[0].clientX - touchStartPos.x;
      const moveY = e.touches[0].clientY - touchStartPos.y;
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      
      if (distance > 5) {
        setIsTouchMoving(true);
      }
      
      // console.log('Touch moving:', { moveX, moveY, distance });
      
      setPosition({
        x: touchStartPos.posX + moveX,
        y: touchStartPos.posY + moveY
      });
    } else if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = center.x - rect.left;
      const centerY = center.y - rect.top;
      
      const scaleDelta = currentDistance / lastTouchDistance;
      const newScale = Math.min(Math.max(0.1, scale * scaleDelta), 3);
      
      const scaleChange = newScale / scale;
      setPosition({
        x: centerX - (centerX - position.x) * scaleChange,
        y: centerY - (centerY - position.y) * scaleChange
      });
      setScale(newScale);
      setLastTouchDistance(currentDistance);
    }
  };

  const handleTouchEnd = (e) => {
    // console.log('Touch end, was moving:', isTouchMoving);
    
    if (e.touches.length < 2) {
      setLastTouchDistance(0);
    }
    if (e.touches.length === 0) {
      setTouchStartPos(null);
      setTimeout(() => setIsTouchMoving(false), 100);
    }
  };

  const handleDeletePerson = async (uniqId) => {
    if (!window.confirm(`Are you sure you want to delete this person?\n\nUnique ID: ${uniqId}\n\nThis action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${main_url}/delete/uniq${uniqId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete person');
      }

      setFamilyData(prevData => prevData.filter(person => person.uniq_id !== uniqId));
      setSelectedPerson(null);
      alert('Person deleted successfully!');
    } catch (err) {
      alert(`Error deleting person: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageEdit = async (e, uniq_id) => {
  const file = e.target.files[0];
  if (!file) return;

  // Convert to base64
  const reader = new FileReader();
  reader.onloadend = async () => {

    const base64 = reader.result; // <-- this becomes image_url

    const res = await fetch(`${main_url}/edit/image/${uniq_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: base64 })
    });

    const data = await res.json();
    console.log("Updated:", data);

    fetchFamilyData(true);
  };

  reader.readAsDataURL(file);
};

  const PersonNode = ({ person, generation = 0 }) => {
    const children = getChildren(person);
    const hasSpouse = person.wife_name && person.wife_name.trim() !== '';
    const [personTouchStart, setPersonTouchStart] = useState(null);

    const handlePersonTouchStart = (e) => {
      e.stopPropagation();
      setPersonTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      });
    };

    const handlePersonTouchEnd = (clickedPerson, e) => {
      if (personTouchStart && !isTouchMoving) {
        const distance = Math.sqrt(
          Math.pow(e.changedTouches[0].clientX - personTouchStart.x, 2) + 
          Math.pow(e.changedTouches[0].clientY - personTouchStart.y, 2)
        );
        const duration = Date.now() - personTouchStart.time;
        
        
        
        if (distance < 10 && duration < 500) {
          e.preventDefault();
        
          setSelectedPerson(clickedPerson);
        }
      }
      setPersonTouchStart(null);
    };
const handleSpouseTouch = (spouseName, e) => {
  if (personTouchStart && !isTouchMoving) {
    const distance = Math.sqrt(
      Math.pow(e.changedTouches[0].clientX - personTouchStart.x, 2) + 
      Math.pow(e.changedTouches[0].clientY - personTouchStart.y, 2)
    );
    const duration = Date.now() - personTouchStart.time;
    
    if (distance < 10 && duration < 500) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Opening spouse modal for:', spouseName);
      
      // Find spouse data from API (or construct from person data)
      const spouseData = {
        name: person.wife_name,
        spouse_image: person.spouse_image || '',
        partners_father_name: person.partners_father_name || '',
        partners_mother_name: person.partners_mother_name || '',
        spouse_adress: person.spouse_adress || '',
        spouse_siblings: person.spouse_siblings || [],
        // You might need to fetch additional spouse data from API
      };
      
      setSelectedSpouse(spouseData);
    }
  }
  setPersonTouchStart(null);
 };
 

    return (
      <div className="tree-node">
        <div className="couple-container">
          <div className="node-content">
            <div 
              className="person-circle"
              onTouchStart={handlePersonTouchStart}
              onTouchEnd={(e) => handlePersonTouchEnd(person, e)}
            >
              <div className="circle-avatar">
                {person.image_url ? (
                  <img src={person.image_url} alt={person.name} />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div className="person-name-label">{person.name}</div>
            </div>

            {hasSpouse && (
              <>
                <div className="marriage-line marriage-line-header-extra">
                  <div className="marriage-heart">♥</div>
                </div>

                <div className="person-circle spouse"
                onTouchStart={handlePersonTouchStart}
  onTouchEnd={(e) => handleSpouseTouch(person.wife_name, e)}

                onClick={() => setSelectedSpouse(person)}
                >
                  <div className="circle-avatar spouse-avatar">
                    {person.spouse_image ? (
                                      <img src={person.spouse_image} alt={person.name} />
                                    ) : (
                                      <User size={32} />
                                    )}
                  </div>
                  <div className="person-name-label">{person.wife_name}</div>
                  {/* <div className="spouse-label">Spouse</div> */}
                </div>
              </>
            )}
          </div>

          {children.length > 0 && (
            <div className="connector-line-down"></div>
          )}
        </div>

        {children.length > 0 && (
          <>
            <div className="children-connector">
              {children.length === 1 ? (
                <div className="single-child-line"></div>
              ) : (
                <>
                  <div className="horizontal-connector-line"></div>
                  {children.map((child, index) => (
                    <div 
                      key={`connector-${child.uniq_id || index}`}
                      className="child-vertical-connector"
                      style={{
                        left: `${(100 / (children.length + 1)) * (index + 1)}%`
                      }}
                    ></div>
                  ))}
                </>
              )}
            </div>
            
            <div className="children-row">
              {children.map((child, index) => (
                <div key={child.uniq_id || index} className="child-wrapper">
                  <PersonNode person={child} generation={generation + 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className='cont-mes'>ಕಾಕಾ, ಅಜ್ಜ, ಅತ್ತೆ ಎಲ್ಲರ history ಹುಡುಕ್ತಾ ಇದ್ದೀವಿ.... 😵‍💫</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchFamilyData}>Retry</button>
      </div>
    );
  }

  const roots = findRootAncestors();

  return (
    <div className="family-tree-app">
     <header className="app-header">
  <div className="header-left">
    <h1>Family Tree</h1>
    <p>
      {familyData.length} family members · Drag to move · Pinch to zoom
      {isRefreshing && <span className="refreshing-indicator"> • Refreshing...</span>}
    </p>
  </div>

  <div className="header-right">
    <button
      onClick={async () => {
        try {
          // Determine the next language
          const newLangIsKannada = !isKannada;
          setIsKannada(newLangIsKannada);

          // Save preference
          localStorage.setItem("languagePreference", newLangIsKannada ? "kn" : "en");

          // Choose backend endpoint
          const endpoint = newLangIsKannada ? "/translate" : "/fetch";
          setLoading(true);
          setLoadingMessage(newLangIsKannada ? "Translating to Kannada..." : "Switching to English...");

          // Fetch data
          const res = await fetch(`${main_url}${endpoint}`);
          const data = await res.json();
          setFamilyData(data);
        } catch (err) {
          console.error("Language toggle failed:", err);
        } finally {
          setLoading(false);
          setLoadingMessage("");
        }
      }}
      className="lang-toggle-btn"
    >
      {isKannada ? "🌐 English" : "🌐 ಕನ್ನಡ"}
    </button>
  </div>
</header>


      <div 
        className="tree-container"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loading && loadingMessage && (
  <div className="loading-overlay">
    <div className="spinner"></div>
    <p>{loadingMessage}</p>
  </div>
)}
        <div 
          className="tree-wrapper"
          ref={treeRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {roots.map(root => (
            <PersonNode key={root.uniq_id} person={root} generation={0} />
          ))}
        </div>
      </div>

      {selectedPerson && (
        <div className="modal-overlay" onClick={() => {
          // console.log('Modal overlay clicked, closing');
          setSelectedPerson(null);
        }}>
          <div className="modal-content" onClick={(e) => {
            // console.log('Modal content clicked');
            e.stopPropagation();
          }}>
            <button className="modal-close" onClick={() => {
              // console.log('Close button clicked');
              setSelectedPerson(null);
            }}>
              <X size={28} />
            </button>
            
          {selectedPerson.image_url ? (
         <div
          className="modal-header"
          style={{
            backgroundImage: `url(${selectedPerson.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderRadius: '8px 8px 0 0',
          }}
          >
            <div className="modal-avatar">
              <img
                src={selectedPerson.image_url}
                alt={selectedPerson.name}
                style={{ borderRadius: '50%', width: '48px', height: '48px' }}
              />
            </div>
            <div>
              <h2>{selectedPerson.name}</h2>
            </div>
          </div>
          )  : (
                <div className="modal-header fallback">
  <div className="modal-avatar">
    <User size={48} />
  </div>

  <div className="fallback-right">
    <h2>{selectedPerson.name}</h2>

    {/* Add Image Button */}
    <button 
      className="add-image-btn" 
      onClick={() => document.getElementById("imageUploadInput").click()}>
      ➕ Add Image
    </button>

    {/* Hidden file input */}
    <input 
      type="file" 
      id="imageUploadInput" 
      style={{ display: "none" }}
      accept="image/*"
      onChange={(e) => handleImageEdit(e, selectedPerson.uniq_id)}
    />
  </div>
</div>

        )}
            <div className="modal-body">
              <div className="info-section">
                <h3>Family Information</h3>
                <div className="info-grid">
                  {selectedPerson.father_name && (
                    <div className="info-item">
                      <strong>Father</strong>
                      <span>{selectedPerson.father_name}</span>
                    </div>
                  )}
                  {selectedPerson.mother_name && (
                    <div className="info-item">
                      <strong>Mother</strong>
                      <span>{selectedPerson.mother_name}</span>
                    </div>
                  )}
                  {selectedPerson.wife_name && (
                    <div className="info-item">
                      <strong>Spouse</strong>
                      <span>{selectedPerson.wife_name}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <strong>Children</strong>
                    <span>{selectedPerson.children?.length || 0}</span>
                  </div>
                </div>
              </div>

              {(selectedPerson.Phone_number || selectedPerson.adress) && (
                <div className="info-section">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    {selectedPerson.Phone_number && (
                      <div className="info-item">
                        <Phone size={18} />
                        <span>{selectedPerson.Phone_number}</span>
                      </div>
                    )}
                    {selectedPerson.adress && (
                      <div className="info-item">
                        <MapPin size={18} />
                        <span>{selectedPerson.adress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPerson.children && selectedPerson.children.length > 0 && (
                <div className="info-section">
                  <h3>Children ({selectedPerson.children.length})</h3>
                  <div className="children-list">
                    {selectedPerson.children.map((child, index) => (
                      <div key={index} className="child-item">
                        {child.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="delete-section">
                <button 
                  className="delete-btn"
                  onClick={() => handleDeletePerson(selectedPerson.uniq_id)}
                  disabled={isDeleting}
                >
                  <Trash2 size={20} />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Person'}</span>
                </button>
                <p className="delete-warning">
                  ⚠️ This action will permanently delete this person from the family tree
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
{selectedSpouse && (
  <div className="modal-overlay" onClick={() => setSelectedSpouse(null)}>
    <div className="modal-content spouse-modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setSelectedSpouse(null)}>
        <X size={28} />
      </button>
      
      {selectedSpouse.spouse_image ? (
      <div className={`modal-header spouse-header ${
    selectedSpouse.spouse_image ? "" : "no-spouse-image"
  }`}
      style={ selectedSpouse.spouse_image ?  {
            backgroundImage: `url(${selectedSpouse.spouse_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderRadius: '8px 8px 0 0',
          } : {}}
      >
        <div className="modal-avatar spouse-avatar-large">
          {selectedSpouse.spouse_image ? (
            <img src={selectedSpouse.spouse_image} alt={selectedSpouse.name} />
          ) : (
            <User size={48} />
          )}
        </div>
        <div>
          <h2>{selectedSpouse.name}</h2>
          <p className="modal-subtitle">Spouse</p>
        </div>
      </div>

        ):(
          <div className="modal-header fallback">
                  <div className="modal-avatar">
                    <User size={48} />
                  </div>
                  <div>
                    <h2>{selectedSpouse.name}</h2>
                  </div>
                </div>
        )}

      <div className="modal-body">
        <div className="info-section">
          <h3>Family Background</h3>
          <div className="info-grid">
            {selectedSpouse.partners_father_name && (
              <div className="info-item">
                <strong>Father</strong>
                <span>{selectedSpouse.partners_father_name}</span>
              </div>
            )}
            {selectedSpouse.partners_mother_name && (
              <div className="info-item">
                <strong>Mother</strong>
                <span>{selectedSpouse.partners_mother_name}</span>
              </div>
            )}
          </div>
        </div>

        {selectedSpouse.spouse_adress && (
          <div className="info-section">
            <h3>Address</h3>
            <div className="info-grid">
              <div className="info-item">
                <MapPin size={18} />
                <span>{selectedSpouse.spouse_adress}</span>
              </div>
            </div>
          </div>
        )}

        {selectedSpouse.spouse_siblings && selectedSpouse.spouse_siblings.length > 0 && (
          <div className="info-section">
            <h3>Siblings ({selectedSpouse.spouse_siblings.length})</h3>
            <div className="children-list">
              {selectedSpouse.spouse_siblings.map((sibling, index) => (
                <div key={index} className="child-item">
                  {sibling.name || sibling}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default FamilyTree;