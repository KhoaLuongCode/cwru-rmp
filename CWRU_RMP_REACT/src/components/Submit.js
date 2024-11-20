import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import coursesData from '../data/courses.json'; // Import the courses JSON
import '../css/Submit.css';
import { showSuccessToast, showErrorToast } from '../utils/Toastr'; // Import toast functions
import professorData from '../data/professors.json';
import { ToastContainer, toast } from 'react-toastify';

export default function Submit({ session }) {
  const [formData, setFormData] = useState({
    professor_name: '',
    course_id: '',
    quality: '',
    difficulty: '',
    comment: '',
    workload: 0,
    semester: '',
    textbook: '',
    extra_credit: 'No', 
    study_tips: '',
    upvote: 0,
    downvote: 0,
    office_hours: ''
  });

  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccessToast('Successfully logged out!');
  };

  useEffect(() => {
    // Load courses and professors from the imported JSON
    setCourses(coursesData);
    setProfessors(professorData);
    // Optional: Add any additional logic here
    console.log('User is logged in:', session.user);
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Submit.js
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that the selected course_id exists in the courses array
    const selectedCourse = courses.find(course => course.course_id === formData.course_id);
    if (!selectedCourse) {
      showErrorToast('Please select a valid course.');
      return;
    }

    // Convert numeric and boolean string values to appropriate data types
    const dataToInsert = {
      ...formData,
      quality: Number(formData.quality),
      difficulty: Number(formData.difficulty),
      workload: Number(formData.workload),
      upvote: Number(formData.upvote),
      downvote: Number(formData.downvote),
      extra_credit: formData.extra_credit === 'Yes', // Convert to boolean
      user_id: session.user.id,
      submitted_at: new Date().toISOString() // Add current timestamp here
    };

    // Save feedback to Supabase
    const { error } = await supabase
      .from('entry') // Make sure to use the correct table name
      .insert([dataToInsert]); // Assuming you want to link to the user's ID

    if (error) {
      console.error('Error inserting data:', error);
      showErrorToast('Error submitting feedback');
    } else {
      showSuccessToast('Feedback submitted successfully!');
      // Reset form data after submission
      setFormData({
        professor_name: '',
        course_id: '',
        quality: '',
        difficulty: '',
        comment: '',
        workload: 0,
        semester: '',
        textbook: '',
        extra_credit: 'No', // reset to 'No'
        study_tips: '',
        upvote: 0,
        downvote: 0,
        office_hours: ''
      });
    }
  };

  return (
    <div className="wrapper">
      <div className="landing-container">
        <h1>Welcome to CWRU RMP!</h1>
        <p>Hi, {session.user.email}. Thank you for joining us!</p>

        <div className="form-section">
          <h2>Feedback about Professors</h2>
          <p>Submit your feedback about professors and help others make informed decisions.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="professor_name">Professor Name:</label>
              <select
                id="professor_name"
                name="professor_name"
                value={formData.professor_name}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a professor</option>
                {professors.map((professor) => (
                  <option key={professor.professor_id} value={`${professor.first_name} ${professor.last_name}`}>
                    {professor.first_name} {professor.last_name} ({professor.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group course">
              <label htmlFor="course_id">Course:</label>
              <select
                id="course_id"
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_id} 
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="quality">Quality (1-5):</label>
              <select
                id="quality"
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select quality</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty (1-5):</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select difficulty</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group comment">
              <label htmlFor="comment">Comment:</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="workload">Workload (hours/week):</label>
              <input
                type="number"
                id="workload"
                name="workload"
                value={formData.workload}
                onChange={(e) => {
                  const { name, value } = e.target;
                  if (value < 0) {
                    showErrorToast('Workload cannot be negative.');
                    return;
                  }
                  setFormData((prevData) => ({
                    ...prevData,
                    [name]: value
                  }));
                }}
                onInput={(e) => {
                  if (e.target.value < 0) e.target.value = 0;
                }}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="semester">Semester:</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a semester</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="textbook">Textbook:</label>
              <input
                type="text"
                id="textbook"
                name="textbook"
                value={formData.textbook}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="extra_credit">Extra Credit:</label>
              <select
                id="extra_credit"
                name="extra_credit"
                value={formData.extra_credit}
                onChange={handleChange}
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            
            <div className="form-group study-tips">
              <label htmlFor="study_tips">Study Tips:</label>
              <textarea
                id="study_tips"
                name="study_tips"
                value={formData.study_tips}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="office_hours">Office Hours:</label>
              <input
                type="text"
                id="office_hours"
                name="office_hours"
                value={formData.office_hours}
                onChange={handleChange}
              />
            </div>
            
            <button type="submit" className="submit-button">Submit Feedback</button>
          </form>
        </div>

        <div className="logout-section">
          <button onClick={handleLogout}>Logout</button>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}