import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import "../css/Professor.css"; // Updated to use Professor.css

const ProfessorPage = () => {
  const { professorId } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [averageQuality, setAverageQuality] = useState(0);
  const [averageDifficulty, setAverageDifficulty] = useState(0);

  useEffect(() => {
    document.title = `Professor: ${professorId.replace('-', ' ')}`;

    const fetchProfessorFeedback = async () => {
      // Fetch data from `entry` table where professor's first_name and last_name match the URL param
      const nameParts = professorId.split('-');
      const firstName = nameParts[0];
      const lastName = nameParts[1];

      const { data, error } = await supabase
        .from('entry')
        .select('*, profiles!fk_user(username)')
        .eq('professor_name', `${firstName} ${lastName}`);

      if (error) {
        console.error('Error fetching professor feedback:', error);
        return;
      }

      setFeedbackData(data);

      if (data && data.length > 0) {
        const totalQuality = data.reduce((acc, entry) => acc + entry.quality, 0);
        const totalDifficulty = data.reduce((acc, entry) => acc + entry.difficulty, 0);
        setAverageQuality(totalQuality / data.length);
        setAverageDifficulty(totalDifficulty / data.length);
      }
    };

    fetchProfessorFeedback();
  }, [professorId]);

  return (
    <div className="professor-page">
      <h1>Professor: {professorId.replace('-', ' ')}</h1>
      <div className="averages">
        <h2>Average Quality: {feedbackData.length > 0 ? averageQuality.toFixed(2) : 'N/A'}</h2>
        <h2>Average Difficulty: {feedbackData.length > 0 ? averageDifficulty.toFixed(2) : 'N/A'}</h2>
      </div>

      {feedbackData.length > 0 ? (
        feedbackData.map((entry, index) => (
          <div key={index} className="feedback-entry">
            <div className="feedback-header">
              <h3>{entry.profiles?.username || 'Anonymous'}</h3>
              <span className="course-id">{entry.course_id}</span>
            </div>
            <div className="feedback-body">
              <p><strong>Professor:</strong> {entry.professor_name}</p>
              <div className="feedback-ratings">
                <p><strong>Quality:</strong> {entry.quality}</p>
                <p><strong>Difficulty:</strong> {entry.difficulty}</p>
                <p><strong>Workload:</strong> {entry.workload}</p>
              </div>
              <p className="feedback-comment"><strong>Comment:</strong> {entry.comment}</p>
              {/* Add more fields as needed */}
            </div>
          </div>
        ))
      ) : (
        <p>No feedback available for this professor.</p>
      )}
    </div>
  );
};

export default ProfessorPage;
