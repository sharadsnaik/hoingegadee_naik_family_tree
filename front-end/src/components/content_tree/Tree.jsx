import React, { useState, useEffect } from 'react';
import { Users, Plus, X, PlusCircle } from 'lucide-react';
import './Tree.css';

const FamilyTree = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [familyData, setFamilyData] = useState([]);
  const [formData, setFormData] = useState({
    image_url: '',
    name: '',
    father_name: '',
    mother_name: '',
    wife_name: '',
    children: [],
    Phone_number: '',
    adress: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [suggestions, setSuggestions] = useState({
    father: [],
    mother: []
  });

  // Sample family tree structure


  // Fetch family data from backend
  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/fetch');
      if (response.ok) {
        const data = await response.json();
        setFamilyData(data);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Get suggestions for father/mother names
  const getSuggestions = (field, value) => {
    if (!value || value.length < 2) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    const filtered = familyData
      .map(member => member.name)
      .filter(name => name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);

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
      adress: formData.adress
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('Success! Member added.');
        fetchFamilyData(); // Refresh data
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
            adress: ''
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
      adress: ''
    });
    setSubmitStatus('');
    setSuggestions({ father: [], mother: [] });
  };

  const FamilyMember = ({ member, level = 0 }) => {
    const hasChildren = member.children && member.children.length > 0;
    const hasSpouse = member.spouse;

    return (
      <div className="family-member-container">
        <div className="member-wrapper">
          <div className="couple-container">
            <div className="member-card">
              <div className={`member-circle ${member.color}`}>
                {member.image_url ? (
                  <img 
                    src={member.image_url} 
                    alt={member.name} 
                    style={{
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%', 
                      objectFit: 'cover'
                    }} 
                  />
                ) : (
                  <Users size={32} />
                )}
              </div>
              <div className="member-name">{member.name}</div>
            </div>

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

          {hasChildren && (
            <div className={`vertical-line level-${level}`}></div>
          )}
        </div>

        {hasChildren && (
          <div className="children-section">
            {member.children.length > 1 && (
              <div 
                className="sibling-connector"
                style={{
                  width: `${(member.children.length - 1) * 180}px`
                }}
              ></div>
            )}
            
            <div className="children-grid">
              {member.children.map((child) => (
                <div key={child.id} className="child-wrapper">
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
      <button 
        className="add-member-btn"
        onClick={() => setShowPopup(true)}
        aria-label="Add Family Member"
      >
        <Plus size={28} />
      </button>

      {showPopup && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleClosePopup}>
              <X size={24} />
            </button>
            
            <h2 className="popup-title">Add Family Member</h2>
            
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

              <div className="form-group">
                <label htmlFor="fatherName">Father Name *</label>
                <input
                  type="text"
                  id="father_name"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  placeholder="Enter father's name"
                  autoComplete="off"
                />
                {suggestions.father.length > 0 && (
                  <div className="suggestions-list">
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
                  placeholder="Enter mother's name"
                  autoComplete="off"
                />
                {suggestions.mother.length > 0 && (
                  <div className="suggestions-list">
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
                <label htmlFor="wifeName">Wife/Spouse Name</label>
                <input
                  type="text"
                  id="wife_name"
                  name="wife_name"
                  value={formData.wife_name}
                  onChange={handleInputChange}
                  placeholder="Enter spouse name"
                />
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
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTree;