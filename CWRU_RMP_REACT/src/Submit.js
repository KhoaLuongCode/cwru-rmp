//submit new feedback
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Submit({ session }) {
  const [formData, setFormData] = useState({
    professor_name: '',
    course_id: '',
    quality: 0,
    difficulty: 0,
    comment: '',
    workload: 0,
    semester: '',
    textbook: '',
    extra_credit: false,
    study_tips: '',
    upvote: 0,
    downvote: 0,
    office_hours: ''
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    // Optional: You can add any additional logic here
    console.log('User is logged in:', session.user);
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save feedback to Supabase
    const { error } = await supabase
      .from('entry') // Make sure to use the correct table name
      .insert([{ ...formData, user_id: session.user.id }]); // Assuming you want to link to the user's ID

    if (error) {
      console.error('Error inserting data:', error);
      alert('Error submitting feedback');
    } else {
      alert('Feedback submitted successfully!');
      // Reset form data after submission
      setFormData({
        professor_name: '',
        course_id: '',
        quality: 0,
        difficulty: 0,
        comment: '',
        workload: 0,
        semester: '',
        textbook: '',
        extra_credit: false,
        study_tips: '',
        upvote: 0,
        downvote: 0,
        office_hours: ''
      });
    }
  };

  return (
    <div className="landing-container" style={{ padding: '20px', color: 'white' }}>
      <h1>Welcome to CWRU RMP!</h1>
      <p>Hi, {session.user.email}. Thank you for joining us!</p>

      <div>
        <h2>Feedback about Professors</h2>
        <p>Submit your feedback about professors and help others make informed decisions.</p>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Professor Name:</label>
            <input
              type="text"
              name="professor_name"
              value={formData.professor_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Course ID:</label>
            <input
              type="text"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Quality (1-5):</label>
            <input
              type="number"
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              min="1"
              max="5"
              required
            />
          </div>
          <div>
            <label>Difficulty (1-5):</label>
            <input
              type="number"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              min="1"
              max="5"
              required
            />
          </div>
          <div>
            <label>Comment:</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Workload (hours/week):</label>
            <input
              type="number"
              name="workload"
              value={formData.workload}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Semester:</label>
            <input
              type="text"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Textbook:</label>
            <input
              type="text"
              name="textbook"
              value={formData.textbook}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Extra Credit:</label>
            <input
              type="checkbox"
              name="extra_credit"
              checked={formData.extra_credit}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Study Tips:</label>
            <textarea
              name="study_tips"
              value={formData.study_tips}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Office Hours:</label>
            <input
              type="text"
              name="office_hours"
              value={formData.office_hours}
              onChange={handleChange}
            />
          </div>
          <div>
            <button className="button block" type="submit">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>

      <div>
        <button className="button block" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}