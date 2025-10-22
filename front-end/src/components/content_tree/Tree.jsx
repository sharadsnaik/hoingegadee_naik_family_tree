import React, { useState } from 'react'
import './Tree.css'

const Tree = () =>{
    const [showform, setshowform] = useState(false);
    const [form_data, setform_data ] = useState({
        user_name:'',
        father_name:'',
        mother_name:'',
        Phone_number:'',
        adress:'',
    })

const handleChange = (e) =>{
    setform_data({ ...form_data, [e.target.name]: e.target.value})
}

const handlingSubmit = async (e) =>{
    e.preventDefault()
    try{
        await fetch('http://127.0.0.1:8000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form_data)
});
        alert('Submitted successfully');
        setshowform(false)
        setform_data({
            user_name:'',
            father_name:'',
            mother_name:'',
            Phone_number:'',
            adress:'',
        })
    }
    catch (err) {
      alert('Error submitting form');
    }
}
  return (
    <div className='main_top_div'>
        <div className='main_tree_branch'>
            Tree
        </div>
        <div>
           <button className="floating-btn" onClick={() => setshowform(true)}>+</button>
      {showform && (
        <div className="popup-overlay">
          <form className="popup-form" onSubmit={handlingSubmit}>
            <h3>Submit Details</h3>
            <input type="text" name="user_name" placeholder="ನಿಮ್ಮ ಹೆಸರು || Name" value={form_data.user_name} onChange={handleChange} required />

            <input type="text" name="father_name" placeholder="ತಂದಯ ಹೆಸರು " value={form_data.father_name} onChange={handleChange} required />
            
            <input type="text" name="mother_name" placeholder="ತಾಯಿಯ ಹೆಸರು" value={form_data.mother_name} onChange={handleChange} required />

            <input type="tel" name="Phone_number" placeholder=" ಮೊಬೈಲ್ ನಂಬರ್ || Phone Number" value={form_data.Phone_number} onChange={handleChange} required />
            
            <input type="text" name="adress" placeholder="ವಿಳಾಸ || Address " value={form_data.adress} onChange={handleChange} required />

            <div className="form-buttons">
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setshowform(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
 
        </div>
    </div>
  )
}

export default Tree