//displays search result for each course
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import "../css/Search.css";

const CoursePage = () => {
    const { courseId } = useParams();
    const [feedbackData, setFeedbackData] = useState({});
    const [averageQuality, setAverageQuality] = useState(0);
    const [averageDifficulty, setAverageDifficulty] = useState(0);

    useEffect(() => {
        document.title = `Course: ${courseId}`;
        const fetchFeedback = async () => {
            // Fetch data from Supabase
            const { data, error } = await supabase
                .from('entry')
                .select('*, profiles!fk_user(username)')
                .eq('course_id', courseId);

            if (error) {
                console.error('Error fetching feedback:', error);
                return;
            }
            console.log('Fetched data:', data);

            // Group feedback by sections
            const groupedFeedback = data.reduce((acc, entry) => {
                const { section } = entry;
                if (!acc[section]) acc[section] = [];
                acc[section].push(entry);
                return acc;
            }, {});

            setFeedbackData(groupedFeedback);
            const totalQuality = data.reduce((acc, entry) => acc + entry.quality, 0);
            const totalDifficulty = data.reduce((acc, entry) => acc + entry.difficulty, 0);

            setAverageQuality(totalQuality / data.length);
            setAverageDifficulty(totalDifficulty / data.length);

        };
        fetchFeedback();



    }, [courseId]);

    return (
        <div>
            <h1>{courseId}</h1>
            <div className="averages">
                <h2>Average Quality: {averageQuality.toFixed(2)}</h2>
                <h2>Average Difficulty: {averageDifficulty.toFixed(2)}</h2>
            </div>

            {Object.keys(feedbackData).map((section) => (
                <div key={section} className="section">
                    {feedbackData[section].map((entry, index) => (
                        <section key={index} className="feedback-entry">
                            <p><strong>User:</strong> {entry.profiles.username}</p>
                            <p><strong>Professor:</strong> {entry.professor_name}</p>
                            <p><strong>Quality:</strong> {entry.quality}</p>
                            <p><strong>Difficulty:</strong> {entry.difficulty}</p>
                            <p><strong>Comment:</strong> {entry.comment}</p>
                            <p><strong>workload:</strong> {entry.workload}</p>
                            {/* Add more fields as needed */}
                        </section>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default CoursePage;
