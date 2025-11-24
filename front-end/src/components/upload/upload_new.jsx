import React, { useState, useEffect } from 'react';
import { Users, Plus, X, PlusCircle } from 'lucide-react';
import './Tree.css';

const FamilyTree = () => {
  const main_url = process.env.REACT_APP_BACKEND_URL;

  // const main_url = 'http://127.0.0.1:8000'
  const [showPopup, setShowPopup] = useState(false);
  const [isSelectingSuggestion, setisSelectingSuggesion] = useState(false);
  const [familyData, setFamilyData] = useState([]);
  const [formData, setFormData] = useState({
    image_url: '',
    name: '',
    father_name: '',
    mother_name: '',
    wife_name: '',
    children: [],
    Phone_number: '',
    adress: '',
    gender:'',
    spouse_image:'',
    partners_father_name: '',
  partners_mother_name: '',
  spouse_adress: '',
  spouse_siblings: []
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [suggestions, setSuggestions] = useState({
    father: [],
    mother: []
  });

  const hideSuggestion = ()=>{
    setSuggestions({father:[], mother:[]})
  }


  // Fetch family data from backend
  useEffect(() => {
    fetchFamilyData();
  }, []);

// use efect for hnadlign app for exiting

  useEffect(() => {
  const handleBack = (event) => {
    if (showPopup) {
      setShowPopup(false);
      return;
    }
  };

  window.addEventListener("popstate", handleBack);
  return () => window.removeEventListener("popstate", handleBack);
}, [showPopup]);


  const fetchFamilyData = async () => {
    try {
      // const response = await fetch();
      const response = await fetch(`${main_url}/fetch`);
      if (response.ok) {
        const data = await response.json();
        setFamilyData(data);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
    }
  };

// const [preview, setPreview] = useState(null);

  // Handle image upload
const handleImageChange = (e) => {
  const file = e.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image_url: reader.result,   // base64 string for preview or upload
        image_file: file            // keep original file if needed for backend
      }));
    };
    reader.readAsDataURL(file);
  } else {
    // If user clears the file input
    setFormData((prev) => ({
      ...prev,
      image_url: null,
      image_file: null
    }));
  }
};


  // Get suggestions for father/mother names
// Get suggestions for father/mother names
const getSuggestions = (field, value) => {
  if (!value || value.length < 2) {
    setSuggestions(prev => ({ ...prev, [field]: [] }));
    return;
  }

  let filtered = [];

  if (field === 'father') {
    // keep existing logic for father suggestions
    filtered = familyData
      .map(member => member.name)
      .filter(name => name && name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);
  } else if (field === 'mother') {
    // extend logic for mother to include both wife_name and name fields
    filtered = familyData
      .flatMap(member => [member.wife_name, member.name]) // include both
      .filter(
        name => name && name.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5);
  }

  setSuggestions(prev => ({ ...prev, [field]: filtered }));
};


  // Auto-fill spouse when father/mother is selected
  const handleParentSelect = (parentType, selectedName) => {
    const member = familyData.find(m => m.name === selectedName);
    
    if (member) {
      if (parentType === 'father') {
        setFormData(prev => ({
          ...prev,
          father_name: selectedName,
          mother_name: member.wife_name || prev.mother_name
        }));
      } else if (parentType === 'mother') {
        setFormData(prev => ({
          ...prev,
          mother_name: selectedName,
          father_name: member.father_name || prev.father_name
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [parentType === 'father' ? 'father_name' : 'mother_name']: selectedName
      }));
    }
    
    setSuggestions(prev => ({ ...prev, [parentType === 'father' ? 'father' : 'mother']: [] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'father_name') {
      getSuggestions('father', value);
    } else if (name === 'mother_name') {
      getSuggestions('mother', value);
    }
  };

  const addChildField = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, '']
    }));
  };

  const removeChildField = (index) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const updateChildName = (index, value) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => i === index ? value : child)
    }));
  };

  const handleSubmit = async () => {
  if (!formData.name || !formData.father_name || !formData.mother_name) {
    setSubmitStatus('Error: Name, Father Name, and Mother Name are required');
    return;
  }

  setSubmitStatus('Submitting...');

  const dataToSubmit = {
    image_url: formData.image_url || '',
    name: formData.name,
    father_name: formData.father_name,
    mother_name: formData.mother_name,
    wife_name: formData.wife_name || '',
    children: formData.children.filter(child => child.trim() !== ""),
    Phone_number: formData.Phone_number,
    adress: formData.adress,
    gender: formData.gender,
    spouse_image: formData.spouse_image,
    partners_father_name: formData.partners_father_name,
    partners_mother_name: formData.partners_mother_name,
    spouse_adress: formData.spouse_adress,
    spouse_siblings: formData.spouse_siblings.filter(s => s.trim() !== '')
  };
  

  try {
    const response = await fetch(`${main_url}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSubmit)
    });

    const result = await response.json();

    if (response.ok) {
      setSubmitStatus('Success! Member added.');
      fetchFamilyData();
      window.dispatchEvent(new CustomEvent('personAdded'));

      setTimeout(() => {
        setShowPopup(false);
        setFormData({
          image_url: '',
          name: '',
          father_name: '',
          mother_name: '',
          wife_name: '',
          children: [],
          Phone_number: '',
          adress: '',
          gender: '',
          spouse_image: '',
          partners_father_name: '',
          partners_mother_name: '',
          spouse_adress: '',
          spouse_siblings: []
        });
        setSubmitStatus('');
      }, 2000);
    } else {
      setSubmitStatus('Error: ' + result.message);
    }
  } catch (error) {
    setSubmitStatus('Error: Could not connect to server');
    console.error('Error:', error);
  }
};


  const handleClosePopup = () => {
    setShowPopup(false);
    setFormData({
      image_url: '',
      name: '',
      father_name: '',
      mother_name: '',
      wife_name: '',
      children: [],
      Phone_number: '',
      adress: '',
      gender:'',
      spouse_image:'',
      partners_father_name: '',
  partners_mother_name: '',
  spouse_adress: '',
  spouse_siblings: []
    });
    setSubmitStatus('');
    setSuggestions({ father: [], mother: [] });
      window.history.back(); // remove the pseudo-page

  };


  

  return (
    <div className="app-container">
      <button 
        className="add-member-btn"
        onClick={() => {
  setShowPopup(true);
  window.history.pushState({ uploadPopup: true }, "");
}}
       
        aria-label="Add Family Member">
      <span>ನೀವ್ ಇದ್ದೀರಾ ⁉️</span>
      <span>ಇಲ್ಲ ಅಂದ್ರೆ ಸೇರಿಸಿ 👨‍👩‍👧‍👦 </span>
            
      </button>

      {showPopup && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleClosePopup}>
              <X size={24} />
            </button>
            
            <h2 className="popup-title">Enter ಎಲ್ಲಾ ಜಾತಕ 📄🕵️ </h2>
            
            <div className="member-form">
              <div className="form-group">
                <label htmlFor="image">Profile Image</label>
        <input
        type="file"
        id="image"
        name="image"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Show preview if available */}
        {formData.image_url && (
    <div style={{ marginTop: "10px" }}>
      <img
        src={formData.image_url}
        alt="Profile Preview"
        style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
      />
    </div>
  )}
   </div>

              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
              </div>
                <div className="form-group gender-toggle">
                <label>Gender</label>
                <div className="gender-buttons">
                  <button
                    type="button"
                    className={`gender-btn ${formData.gender === 'male' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                  >
                    👨 Male
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${formData.gender === 'female' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                  >
                    👩 Female
                  </button>
                </div>
              </div>
              

              <div className="form-group">
                <label htmlFor="fatherName">Father Name *</label>
                <input
                  type="text"
                  id="father_name"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && hideSuggestion()}
                  onBlur={() =>{
                    if (!isSelectingSuggestion) hideSuggestion();
                  }}
                  placeholder="ತಂದೆಯ ಹೆಸರು 👱‍♂️"
                  autoComplete="off"
                />
                {suggestions.father.length > 0 && (
                  <div className="suggestions-list"
                  onMouseDown={() => setisSelectingSuggesion(true)}
                  onMouseUp={() => setisSelectingSuggesion(false)}
                  >
                    {suggestions.father.map((name, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onClick={() => handleParentSelect('father', name)}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="mother_name">Mother Name *</label>
                <input
                  type="text"
                  id="mother_name"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleInputChange}
                  onBlur={()=>{
                    if (!isSelectingSuggestion) hideSuggestion()
                  }}
  onKeyDown={(e) => e.key === "Enter" && hideSuggestion()}
                  placeholder="ತಾಯಿಯ ಹೆಸರು 👱‍♀️"
                  autoComplete="off"
                />
                {suggestions.mother.length > 0 && (
                  <div className="suggestions-list"
                  onMouseDown={() => setisSelectingSuggesion(true)}onMouseUp={() => setisSelectingSuggesion(false)}
                  >
                    {suggestions.mother.map((name, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onClick={() => handleParentSelect('mother', name)}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="wifeName">{formData.gender ==='female' ? 'ಪತಿ /ಗಂಡನ ಹೆಸರು ' : 'ಹೆಂಡತಿ /ಮಡದಿಯ ಹೆಸರು'}</label>
                <input
                  type="text"
                  id="wife_name"
                  name="wife_name"
                  value={formData.wife_name}
                  onChange={handleInputChange}
                  placeholder={`Enter ${formData.gender === 'female' ? "ಪತಿ /ಗಂಡನ " : "ಹೆಂಡತಿ /ಮಡದಿಯ"} ಹೆಸರು`}
                />
                 {/* spouse image upload appears when a name is entered */}
               {formData.wife_name && (
  <div className="spouse-image-upload">
    <label htmlFor="spouseImage" className="small-label">
      ಒಂದು ನಿಮ್ಮ {formData.gender === 'female' ? 'ಮನೆಯವರ' : 'ಹೆಂಡ್ತಿ'} ಚಿತ್ರ 📸
    </label>
    <input
      type="file"
      id="spouseImage"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => ({ ...prev, spouse_image: reader.result }));
          };
          reader.readAsDataURL(file);
        }
      }}
      style={{width:"90%"}}
    />
    {formData.spouse_image && (
    <div style={{ marginTop: "10px" }}>
      <img
        src={formData.spouse_image}
        alt="Profile Preview"
        style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
      />
    </div>
  )}


    <div className="spouse-details">
      <div className="spouse-details-container">
  <div className="spouse-details-card">
    <h3 className="section-title">Spouse Details</h3>
    <div className="nentara_basic_details">
      <span>
        <label htmlFor="partners_father_name">
          {formData.gender === 'male' ? 'ನಿಮ್ಮ ನೆಂಟರೆ ಮನೆ ಮಾವನ ಹೆಸರು' : 'ನಿಮ್ಮ ಮಾವ ಹೆಸರು'}
        </label>
        <input
          type="text"
          id="partners_father_name"
          name="partners_father_name"
          value={formData.partners_father_name || ''}
          onChange={handleInputChange}
          placeholder="Enter full name"
        />
      </span>

      <span>
        <label htmlFor="partners_mother_name">
          {formData.gender === 'male' ? 'ನಿಮ್ಮ ನೆಂಟರೆ ಮನೆ ಅತ್ತೆ ಹೆಸರು' : 'ನಿಮ್ಮ ಅತ್ತೆ ಹೆಸರು'}
        </label>
        <input
          type="text"
          id="partners_mother_name"
          name="partners_mother_name"
          value={formData.partners_mother_name || ''}
          onChange={handleInputChange}
          placeholder="Enter full name"
        />
      </span>

      <span>
        <label htmlFor="spouse_adress">
          {formData.gender === 'male' ? 'Wife Address' : 'Husband Address'}
        </label>
        <input
          type="text"
          id="spouse_adress"
          name="spouse_adress"
          value={formData.spouse_adress || ''}
          onChange={handleInputChange}
          placeholder="Enter address"
        />
      </span>
      <div className="form-group spouse-siblings">
        <label>
          {formData.gender === 'male' ? 'Wife’s Siblings' : 'Husband’s Siblings'}
        </label>

        {(formData.spouse_siblings || []).map((sibling, index) => (
          <div key={index} className="child-input-group">
            <input
              type="text"
              value={sibling}
              onChange={(e) => {
                const newSiblings = [...(formData.spouse_siblings || [])];
                newSiblings[index] = e.target.value;
                setFormData(prev => ({ ...prev, spouse_siblings: newSiblings }));
              }}
              placeholder={`Sibling ${index + 1} name`}
            />
            <button
              type="button"
              className="remove-child-btn"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  spouse_siblings: prev.spouse_siblings.filter((_, i) => i !== index)
                }));
              }}
            >
              <X size={18} />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="add-child-btn"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              spouse_siblings: [...(prev.spouse_siblings || []), '']
            }));
          }}
        >
          <PlusCircle size={18} />
          <span>Add {formData.gender === 'male' ? 'Wife’s' : 'Husband’s'} Sibling</span>
        </button>
      </div>
    </div>
  </div>
</div>


      {/* ✨ NEW: Add Siblings Section */}
      
    </div>
  </div>
)}

              </div>

              <div className="form-group">
                <label>Children</label>
                {formData.children.map((child, index) => (
                  <div key={index} className="child-input-group">
                    <input
                      type="text"
                      value={child}
                      onChange={(e) => updateChildName(index, e.target.value)}
                      placeholder={`Child ${index + 1} name`}
                    />
                    <button
                      type="button"
                      className="remove-child-btn"
                      onClick={() => removeChildField(index)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-child-btn"
                  onClick={addChildField}
                >
                  <PlusCircle size={18} />
                  <span>Add Child</span>
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="Phone_number"
                  name="Phone_number"
                  value={formData.Phone_number}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="adress">Address</label>
                <input
                  type="text"
                  id="adress"
                  name="adress"
                  value={formData.adress}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                />
              </div>

              {submitStatus && (
                <div className={`status-message ${submitStatus.includes('Success') ? 'success' : 'error'}`}>
                  {submitStatus}
                </div>
              )}

              <button type="button" className="submit-btn" onClick={handleSubmit}>
                Submit ✅✅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTree;