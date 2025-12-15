// import React, { useState, useEffect, useRef } from 'react';
// import { User, Phone, MapPin, X, Trash2 } from 'lucide-react';
// import './FamilyTree.css';
// import '../../App.css'

// const FamilyTree = () => {
//   // const main_url = process.env.REACT_APP_BACKEND_URL;

//   const main_url = 'http://127.0.0.1:8000'
//   const [familyData, setFamilyData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedPerson, setSelectedPerson] = useState(null);

//   const [isDeleting, setIsDeleting] = useState(false);

//   const [scale, setScale] = useState(0.4);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [lastTouchDistance, setLastTouchDistance] = useState(0);
//   const [touchStartPos, setTouchStartPos] = useState(null);
//   const [isTouchMoving, setIsTouchMoving] = useState(false);

//   const containerRef = useRef(null);
//   const treeRef = useRef(null);
// const [isRefreshing, setIsRefreshing] = useState(false);
// const [selectedSpouse, setSelectedSpouse] = useState(null);

// const [isKannada, setIsKannada] = useState(false);
// const [loadingMessage, setLoadingMessage] = useState("");

// useEffect(() => {
//   // Initial fetch when component mounts
//   fetchFamilyData();

//   // Define the event handler function
//   const handlePersonAdded = (event) => {
//     console.log('🔔 Person added event received!');

//     // Optional: If you passed data with the event
//     if (event.detail?.newPerson) {
//       console.log('New person data:', event.detail.newPerson);
//     }

//     // Refresh the tree
//     console.log('♻️ Refreshing family tree...');
//     fetchFamilyData(true);
//   };

//   // Add event listener
//   window.addEventListener('personAdded', handlePersonAdded);

//   // Cleanup function - removes listener when component unmounts
//   return () => {
//     console.log('🧹 Cleaning up personAdded event listener');
//     window.removeEventListener('personAdded', handlePersonAdded);
//   };
// }, []); // Empty dependency array = runs once on mount`


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

//   // Useeffect for saving And laoding transalted data form system local
//  useEffect(() => {
//   const savedLang = localStorage.getItem("languagePreference");
//   const isKn = savedLang === "kn";
//   const endpoint = isKn ? "/translate" : "/fetch";

//   (async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${main_url}${endpoint}`);
//       const data = await res.json();
//       setFamilyData(data);
//       setIsKannada(isKn);
//     } catch (err) {
//       console.error("Error loading data:", err);
//     } finally {
//       setLoading(false);
//     }
//   })();
// }, [isKannada]);
//   const fetchFamilyData = async (isAutoRefresh = false) => {
//     try {
//       if (isAutoRefresh){
//         setIsRefreshing(true)
//       }else{
//         setLoading(true)
//       }
//       const response = await fetch(`${main_url}/fetch`);
//       if (!response.ok) throw new Error('Failed to fetch family data');
//       const data = await response.json();
//       setFamilyData(data);

//       if (isAutoRefresh){
//         console.log('Tree Refreshed')
//       }}
//       catch(err){
//         setError(err.message);
//       }
//       finally{
//       setLoading(false);
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
//     if (e.target.closest('.modal-overlay')) return;

//     // console.log('Touch start:', e.touches.length, 'touches');

//     if (e.touches.length === 1) {
//       setTouchStartPos({
//         x: e.touches[0].clientX,
//         y: e.touches[0].clientY,
//         posX: position.x,
//         posY: position.y
//       });
//       setIsTouchMoving(false);
//     } else if (e.touches.length === 2) {
//       setTouchStartPos(null);
//       setIsTouchMoving(false);
//       setLastTouchDistance(getTouchDistance(e.touches));
//     }
//   };

//   const handleTouchMove = (e) => {
//     if (e.target.closest('.modal-overlay')) return;

//     if (e.touches.length === 1 && touchStartPos) {
//       const moveX = e.touches[0].clientX - touchStartPos.x;
//       const moveY = e.touches[0].clientY - touchStartPos.y;
//       const distance = Math.sqrt(moveX * moveX + moveY * moveY);

//       if (distance > 5) {
//         setIsTouchMoving(true);
//       }

//       // console.log('Touch moving:', { moveX, moveY, distance });

//       setPosition({
//         x: touchStartPos.posX + moveX,
//         y: touchStartPos.posY + moveY
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
//       setPosition({
//         x: centerX - (centerX - position.x) * scaleChange,
//         y: centerY - (centerY - position.y) * scaleChange
//       });
//       setScale(newScale);
//       setLastTouchDistance(currentDistance);
//     }
//   };

//   const handleTouchEnd = (e) => {
//     // console.log('Touch end, was moving:', isTouchMoving);

//     if (e.touches.length < 2) {
//       setLastTouchDistance(0);
//     }
//     if (e.touches.length === 0) {
//       setTouchStartPos(null);
//       setTimeout(() => setIsTouchMoving(false), 100);
//     }
//   };

//   const handleDeletePerson = async (uniqId) => {
//     if (!window.confirm(`Are you sure you want to delete this person?\n\nUnique ID: ${uniqId}\n\nThis action cannot be undone.`)) {
//       return;
//     }

//     setIsDeleting(true);
//     try {
//       const response = await fetch(`${main_url}/delete/uniq${uniqId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete person');
//       }

//       setFamilyData(prevData => prevData.filter(person => person.uniq_id !== uniqId));
//       setSelectedPerson(null);
//       alert('Person deleted successfully!');
//     } catch (err) {
//       alert(`Error deleting person: ${err.message}`);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

// const handleImageEdit = async (e, uniq_id, gender) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();

//   reader.onloadend = async () => {
//     const base64 = reader.result;

//     const res = await fetch(`${main_url}/edit/image/${uniq_id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         image_url: base64,
//         gender: gender        // <-- IMPORTANT
//       })
//     });

//     const data = await res.json();
//     console.log("Updated:", data);

//     fetchFamilyData(true);
//     if (gender === "male") {
//       setSelectedPerson(null);
//     } else {
//       setSelectedSpouse(null);
//     }
//   };

//   reader.readAsDataURL(file);
// };

// const handleDeleteChild = async (parentId, childId) => {
//   if (!window.confirm("Remove this child from parent?")) return;

//   try {
//     const res = await fetch(`${main_url}/delete/child/${parentId}/${childId}`, {
//       method: "DELETE",
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.detail || "Failed to delete child");
//       return;
//     }

//     alert("Child removed!");

//     // Refresh family data
//     await fetchFamilyData(true);

//     // Update modal instantly
//     setSelectedPerson(null);
//     const refreshedParent = findPersonByUniqId(parentId);
//     setSelectedPerson(refreshedParent);


//   } catch (error) {
//     alert("Error deleting child");
//     console.error(error);
//   }
// };

//   const PersonNode = ({ person, generation = 0 }) => {
//     const children = getChildren(person);
//     const hasSpouse = person.wife_name && person.wife_name.trim() !== '';
//     const [personTouchStart, setPersonTouchStart] = useState(null);

//     const handlePersonTouchStart = (e) => {
//       e.stopPropagation();
//       setPersonTouchStart({
//         x: e.touches[0].clientX,
//         y: e.touches[0].clientY,
//         time: Date.now()
//       });
//     };

//     const handlePersonTouchEnd = (clickedPerson, e) => {
//       if (personTouchStart && !isTouchMoving) {
//         const distance = Math.sqrt(
//           Math.pow(e.changedTouches[0].clientX - personTouchStart.x, 2) +
//           Math.pow(e.changedTouches[0].clientY - personTouchStart.y, 2)
//         );
//         const duration = Date.now() - personTouchStart.time;



//         if (distance < 10 && duration < 500) {
//           e.preventDefault();

//           setSelectedPerson(clickedPerson);
//         }
//       }
//       setPersonTouchStart(null);
//     };
// const handleSpouseTouch = (spouseName, e) => {
//   if (personTouchStart && !isTouchMoving) {
//     const distance = Math.sqrt(
//       Math.pow(e.changedTouches[0].clientX - personTouchStart.x, 2) +
//       Math.pow(e.changedTouches[0].clientY - personTouchStart.y, 2)
//     );
//     const duration = Date.now() - personTouchStart.time;

//     if (distance < 10 && duration < 500) {
//       e.preventDefault();
//       e.stopPropagation();
//       console.log('Opening spouse modal for:', spouseName);

//       // Find spouse data from API (or construct from person data)
//       const spouseData = {
//         name: person.wife_name,
//         spouse_image: person.spouse_image || '',
//         partners_father_name: person.partners_father_name || '',
//         partners_mother_name: person.partners_mother_name || '',
//         spouse_adress: person.spouse_adress || '',
//         spouse_siblings: person.spouse_siblings || [],
//           parent_uniq_id: person.uniq_id    // <-- FIX

//         // You might need to fetch additional spouse data from API
//       };

//       setSelectedSpouse(spouseData);
//     }
//   }
//   setPersonTouchStart(null);
//  };


//     return (
//       <div className="tree-node">
//         <div className="couple-container">
//           <div className="node-content">
//             <div
//               className="person-circle"
//               onTouchStart={handlePersonTouchStart}
//               onTouchEnd={(e) => handlePersonTouchEnd(person, e)}
//             >
//               <div className="circle-avatar">
//                 {person.image_url ? (
//                   <img src={person.image_url} alt={person.name} />
//                 ) : (
//                   <User size={32} />
//                 )}
//               </div>
//               <div className="person-name-label">{person.name}</div>
//             </div>

//             {hasSpouse && (
//               <>
//                 <div className="marriage-line marriage-line-header-extra">
//                   <div className="marriage-heart">♥</div>
//                 </div>

//                 <div className="person-circle spouse"
//                 onTouchStart={handlePersonTouchStart}
//   onTouchEnd={(e) => handleSpouseTouch(person.wife_name, e)}

//                 onClick={() => setSelectedSpouse(person)}
//                 >
//                   <div className="circle-avatar spouse-avatar">
//                     {person.spouse_image ? (
//                                       <img src={person.spouse_image} alt={person.name} />
//                                     ) : (
//                                       <User size={32} />
//                                     )}
//                   </div>
//                   <div className="person-name-label">{person.wife_name}</div>
//                   {/* <div className="spouse-label">Spouse</div> */}
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
//         <p className='cont-mes'>ಕಾಕಾ, ಅಜ್ಜ, ಅತ್ತೆ ಎಲ್ಲರ history ಹುಡುಕ್ತಾ ಇದ್ದೀವಿ.... 😵‍💫</p>
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
//      <header className="app-header">
//   <div className="header-left">
//     <h1>Family Tree</h1>
//     <p>
//       {familyData.length} family members · Drag to move · Pinch to zoom
//       {isRefreshing && <span className="refreshing-indicator"> • Refreshing...</span>}
//     </p>
//   </div>

//   <div className="header-right">
//     <button
//       onClick={async () => {
//         try {
//           // Determine the next language
//           const newLangIsKannada = !isKannada;
//           setIsKannada(newLangIsKannada);

//           // Save preference
//           localStorage.setItem("languagePreference", newLangIsKannada ? "kn" : "en");

//           // Choose backend endpoint
//           const endpoint = newLangIsKannada ? "/translate" : "/fetch";
//           setLoading(true);
//           setLoadingMessage(newLangIsKannada ? "Translating to Kannada..." : "Switching to English...");

//           // Fetch data
//           const res = await fetch(`${main_url}${endpoint}`);
//           const data = await res.json();
//           setFamilyData(data);
//         } catch (err) {
//           console.error("Language toggle failed:", err);
//         } finally {
//           setLoading(false);
//           setLoadingMessage("");
//         }
//       }}
//       className="lang-toggle-btn"
//     >
//       {isKannada ? "🌐 English" : "🌐 ಕನ್ನಡ"}
//     </button>
//   </div>
// </header>


//       <div
//         className="tree-container"
//         ref={containerRef}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         {loading && loadingMessage && (
//   <div className="loading-overlay">
//     <div className="spinner"></div>
//     <p>{loadingMessage}</p>
//   </div>
// )}
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
//         <div className="modal-overlay" onClick={() => {
//           // console.log('Modal overlay clicked, closing');
//           setSelectedPerson(null);
//         }}>
//           <div className="modal-content" onClick={(e) => {
//             // console.log('Modal content clicked');
//             e.stopPropagation();
//           }}>
//             <button className="modal-close" onClick={() => {
//               // console.log('Close button clicked');
//               setSelectedPerson(null);
//             }}>
//               <X size={28} />
//             </button>

//           {selectedPerson.image_url ? (
//          <div
//           className="modal-header"
//           style={{
//             backgroundImage: `url(${selectedPerson.image_url})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat',
//             color: 'white',
//             padding: '1rem',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '1rem',
//             borderRadius: '8px 8px 0 0',
//           }}
//           >
//             <div className="modal-avatar">
//               <img
//                 src={selectedPerson.image_url}
//                 alt={selectedPerson.name}
//                 style={{ borderRadius: '50%', width: '48px', height: '48px' }}
//               />
//             </div>
//             <div>
//               <h2>{selectedPerson.name}</h2>
//             </div>
//           </div>
//           )  : (
//                 <div className="modal-header fallback">
//   <div className="modal-avatar">
//     <User size={48} />
//   </div>

//   <div className="fallback-right">
//     <h2>{selectedPerson.name}</h2>

//     {/* Add Image Button */}
//     <button
//       className="add-image-btn"
//       onClick={() => document.getElementById("PersonImageUpload").click()}>
//       ➕ Add Image
//     </button>

//     {/* Hidden file input */}
//     <input
//       type="file"
//       id="PersonImageUpload"
//       style={{ display: "none" }}
//       accept="image/*"
//       onChange={(e) => handleImageEdit(e, selectedPerson.uniq_id, 'male')}
//     />
//   </div>
// </div>

//         )}
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
//   <span>{child.name}</span>

//   <button
//     className="delete-child-btn"
//     onClick={() => handleDeleteChild(selectedPerson.uniq_id, child.uniq_id)}
//   >
//     ❌
//   </button>
// </div>

//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="delete-section">
//                 <button
//                   className="delete-btn"
//                   onClick={() => handleDeletePerson(selectedPerson.uniq_id)}
//                   disabled={isDeleting}
//                 >
//                   <Trash2 size={20} />
//                   <span>{isDeleting ? 'Deleting...' : 'Delete Person'}</span>
//                 </button>
//                 <p className="delete-warning">
//                   ⚠️ This action will permanently delete this person from the family tree
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

// {selectedSpouse && (
//   <div className="modal-overlay" onClick={() => setSelectedSpouse(null)}>
//     <div className="modal-content spouse-modal" onClick={(e) => e.stopPropagation()}>
//       <button className="modal-close" onClick={() => setSelectedSpouse(null)}>
//         <X size={28} />
//       </button>

//       {selectedSpouse.spouse_image ? (
//       <div className={`modal-header spouse-header ${
//     selectedSpouse.spouse_image ? "" : "no-spouse-image"
//   }`}
//       style={ selectedSpouse.spouse_image ?  {
//             backgroundImage: `url(${selectedSpouse.spouse_image})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat',
//             color: 'white',
//             padding: '1rem',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '1rem',
//             borderRadius: '8px 8px 0 0',
//           } : {}}
//       >
//         <div className="modal-avatar spouse-avatar-large">
//           {selectedSpouse.spouse_image ? (
//             <img src={selectedSpouse.spouse_image} alt={selectedSpouse.name} />
//           ) : (
//             <User size={48} />
//           )}
//         </div>
//         <div>
//           <h2>{selectedSpouse.name}</h2>
//           <p className="modal-subtitle">Spouse</p>
//         </div>
//       </div>

//         ):(
//           <div className="modal-header fallback">
//                   <div className="modal-avatar">
//                     <User size={48} />
//                   </div>
//                   <div>
//                     <h2>{selectedSpouse.name}</h2>


//    <button
//   className="add-image-btn"
//   onClick={() => document.getElementById("SpouseImageUpload").click()}>
//   ➕ Add Image
// </button>

// <input
//   type="file"
//   id="SpouseImageUpload"
//   style={{ display: "none" }}
//   accept="image/*"
// onChange={(e) => handleImageEdit(e, selectedSpouse.parent_uniq_id, 'female')}
// />

//                   </div>
//                 </div>
//         )}

//       <div className="modal-body">
//         <div className="info-section">
//           <h3>Family Background</h3>
//           <div className="info-grid">
//             {selectedSpouse.partners_father_name && (
//               <div className="info-item">
//                 <strong>Father</strong>
//                 <span>{selectedSpouse.partners_father_name}</span>
//               </div>
//             )}
//             {selectedSpouse.partners_mother_name && (
//               <div className="info-item">
//                 <strong>Mother</strong>
//                 <span>{selectedSpouse.partners_mother_name}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {selectedSpouse.spouse_adress && (
//           <div className="info-section">
//             <h3>Address</h3>
//             <div className="info-grid">
//               <div className="info-item">
//                 <MapPin size={18} />
//                 <span>{selectedSpouse.spouse_adress}</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {selectedSpouse.spouse_siblings && selectedSpouse.spouse_siblings.length > 0 && (
//           <div className="info-section">
//             <h3>Siblings ({selectedSpouse.spouse_siblings.length})</h3>
//             <div className="children-list">
//               {selectedSpouse.spouse_siblings.map((sibling, index) => (
//                 <div key={index} className="child-item">
//                   {sibling.name || sibling}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default FamilyTree;



import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, X, Trash2 } from 'lucide-react';
import './FamilyTree.css';
import '../../App.css';

const FamilyTree = () => {
  // const main_url = process.env.REACT_APP_BACKEND_URL;
  const main_url = 'http://127.0.0.1:8000';
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

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);

  const containerRef = useRef(null);
  const treeRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSpouse, setSelectedSpouse] = useState(null);

  const [isKannada, setIsKannada] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

const [showEditPopup, setShowEditPopup] = useState(false);
const [editFormData, setEditFormData] = useState({});

const isEditingPerson = !!selectedPerson && !selectedSpouse;
const isEditingSpouse = !!selectedSpouse;


const getMissingFields = (person) => {
        if (!person) return [];
        const requiredFields = [
          "father_name",
          "mother_name",
          "Phone_number",
          "adress",
        ];

        return requiredFields.filter(
          (field) => !person[field] || person[field].trim() === ""
        );
      };

  const getMissingSpouseFields = (spouse) => {
  if (!spouse) return [];

  const requiredFields = [
    "partners_father_name",
    "partners_mother_name",
    "spouse_adress",
  ];

  return requiredFields.filter(
    (field) => !spouse[field] || spouse[field].trim() === ""
  );
};


  useEffect(() => {
    fetchFamilyData();

    const handlePersonAdded = (event) => {
      fetchFamilyData(true);
    };

    window.addEventListener('personAdded', handlePersonAdded);

    return () => {
      window.removeEventListener('personAdded', handlePersonAdded);
    };
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
      if (isAutoRefresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      const response = await fetch(`${main_url}/fetch`);
      if (!response.ok) throw new Error('Failed to fetch family data');
      const data = await response.json();
      setFamilyData(data);
      if (isAutoRefresh) {
        console.log('Tree Refreshed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  // --- Mouse drag/pan support ---
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left button
    setIsDragging(true);
    setDragStartPos({
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y
    });
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (isDragging && dragStartPos) {
      const moveX = e.clientX - dragStartPos.x;
      const moveY = e.clientY - dragStartPos.y;
      setPosition({
        x: dragStartPos.posX + moveX,
        y: dragStartPos.posY + moveY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartPos(null);
    document.body.style.userSelect = "";
  };

  // --- Mouse wheel zoom ---
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      const scaleDelta = e.deltaY > 0 ? 0.95 : 1.06;
      const newScale = Math.min(Math.max(0.1, scale * scaleDelta), 3);

      const scaleChange = newScale / scale;
      setPosition({
        x: mouseX - (mouseX - position.x) * scaleChange,
        y: mouseY - (mouseY - position.y) * scaleChange
      });
      setScale(newScale);
    }
  };

  // --- Touch support ---
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

  const handleImageEdit = async (e, uniq_id, gender) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const res = await fetch(`${main_url}/edit/image/${uniq_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image_url: base64,
          gender: gender
        })
      });
      const data = await res.json();
      fetchFamilyData(true);
      if (gender === "male") {
        setSelectedPerson(null);
      } else {
        setSelectedSpouse(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteChild = async (parentId, childId) => {
    if (!window.confirm("Remove this child from parent?")) return;
    try {
      const res = await fetch(`${main_url}/delete/child/${parentId}/${childId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Failed to delete child");
        return;
      }
      alert("Child removed!");
      await fetchFamilyData(true);
      setSelectedPerson(null);
      const refreshedParent = findPersonByUniqId(parentId);
      setSelectedPerson(refreshedParent);
    } catch (error) {
      alert("Error deleting child");
      console.error(error);
    }
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
          const spouseData = {
            name: person.wife_name,
            spouse_image: person.spouse_image || '',
            partners_father_name: person.partners_father_name || '',
            partners_mother_name: person.partners_mother_name || '',
            spouse_adress: person.spouse_adress || '',
            spouse_siblings: person.spouse_siblings || [],
            parent_uniq_id: person.uniq_id
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
                <div
                  className="person-circle spouse"
                  onTouchStart={handlePersonTouchStart}
                  onTouchEnd={(e) => handleSpouseTouch(person.wife_name, e)}
                  onClick={() => setSelectedSpouse({
                    name: person.wife_name,
                    spouse_image: person.spouse_image || '',
                    partners_father_name: person.partners_father_name || '',
                    partners_mother_name: person.partners_mother_name || '',
                    spouse_adress: person.spouse_adress || '',
                    spouse_siblings: person.spouse_siblings || [],
                    parent_uniq_id: person.uniq_id
                  })}
                >
                  <div className="circle-avatar spouse-avatar">
                    {person.spouse_image ? (
                      <img src={person.spouse_image} alt={person.name} />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className="person-name-label">{person.wife_name}</div>
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
                const newLangIsKannada = !isKannada;
                setIsKannada(newLangIsKannada);
                localStorage.setItem("languagePreference", newLangIsKannada ? "kn" : "en");
                const endpoint = newLangIsKannada ? "/translate" : "/fetch";
                setLoading(true);
                setLoadingMessage(newLangIsKannada ? "Translating to Kannada..." : "Switching to English...");
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        tabIndex={0}
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
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPerson(null)}>
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
                  <img src={selectedPerson.image_url} alt={selectedPerson.name} style={{ borderRadius: '50%', width: '48px', height: '48px' }} />
                </div>
                <div>
                  <h2>{selectedPerson.name}</h2>
                </div>
              </div>
            ) : (
              <div className="modal-header fallback">
                <div className="modal-avatar">
                  <User size={48} />
                </div>
                <div className="fallback-right">
                  <h2>{selectedPerson.name}</h2>
                  <button className="add-image-btn" onClick={() => document.getElementById("PersonImageUpload").click()}>
                    ➕ Add Image
                  </button>
                  <input
                    type="file"
                    id="PersonImageUpload"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => handleImageEdit(e, selectedPerson.uniq_id, 'male')}
                  />
                </div>
              </div>
            )}

            {getMissingFields(selectedPerson).length > 0 && (
  <button
    className="edit-btn"
    onClick={() => {
      setEditFormData({});
      setShowEditPopup(true);
    }}
  >
    ✏️ Edit Missing Info
  </button>
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
                        <span>{child.name}</span>
                        <button
                          className="delete-child-btn"
                          onClick={() => handleDeleteChild(selectedPerson.uniq_id, child.uniq_id)}
                        >
                          ❌
                        </button>
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
              <div className={`modal-header spouse-header`} style={{
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
              }}>
                <div className="modal-avatar spouse-avatar-large">
                  <img src={selectedSpouse.spouse_image} alt={selectedSpouse.name} />
                </div>
                <div>
                  <h2>{selectedSpouse.name}</h2>
                  <p className="modal-subtitle">Spouse</p>
                </div>
              </div>
            ) : (
              <div className="modal-header fallback">
                <div className="modal-avatar">
                  <User size={48} />
                </div>
                <div>
                  <h2>{selectedSpouse.name}</h2>
                  <button
                    className="add-image-btn"
                    onClick={() => document.getElementById("SpouseImageUpload").click()}
                  >
                    ➕ Add Image
                  </button>
                  <input
                    type="file"
                    id="SpouseImageUpload"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => handleImageEdit(e, selectedSpouse.parent_uniq_id, 'female')}
                  />
                </div>
              </div>
            )}

            {getMissingSpouseFields(selectedSpouse).length > 0 && (
  <button
    className="edit-btn"
    onClick={() => {
      setEditFormData({});
      setShowEditPopup(true);
    }}
  >
    ✏️ Edit Missing Info
  </button>
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



      {showEditPopup && (selectedPerson || selectedSpouse) && (
  <div className="modal-overlay" onClick={() => setShowEditPopup(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2>Update Missing Information</h2>

      {/* PERSON (HUSBAND) FIELDS */}
{isEditingPerson &&
  getMissingFields(selectedPerson).map((field) => (
    <input
      key={field}
      placeholder={`Enter ${field.replaceAll("_", " ")}`}
      value={editFormData[field] || ""}
      onChange={(e) =>
        setEditFormData({
          ...editFormData,
          [field]: e.target.value,
        })
      }
      style={{ marginBottom: "10px", width: "100%" }}
    />
  ))}

{/* SPOUSE FIELDS */}
{isEditingSpouse &&
  getMissingSpouseFields(selectedSpouse).map((field) => (
    <input
      key={field}
      placeholder={`Enter ${field.replaceAll("_", " ")}`}
      value={editFormData[field] || ""}
      onChange={(e) =>
        setEditFormData({
          ...editFormData,
          [field]: e.target.value,
        })
      }
      style={{ marginBottom: "10px", width: "100%" }}
    />
  ))}



      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <button onClick={() => setShowEditPopup(false)}>Cancel</button>
        <button
          onClick={async () => {
            try {
              const targetUniqId = isEditingPerson
  ? selectedPerson.uniq_id
  : selectedSpouse.parent_uniq_id;

const res = await fetch(
  `${main_url}/update-person/${targetUniqId}`,
  {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editFormData),
  }
);


              if (!res.ok) throw new Error("Update failed");

              alert("✅ Updated successfully");
              setShowEditPopup(false);
              setEditFormData({});
              fetchFamilyData(true);
            } catch (err) {
              alert("❌ Update failed");
            }
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}




    </div>
  );
};

export default FamilyTree;
