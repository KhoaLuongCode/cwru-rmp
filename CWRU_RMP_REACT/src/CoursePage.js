//displays search result for each course
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import "./Search.css"

const CoursePage = () => {
    const { courseId } = useParams();
    const [feedbackData, setFeedbackData] = useState({});

    useEffect(() => {
        document.title = `Course: ${courseId}`;
        const fetchFeedback = async () => {
            // Fetch data from Supabase
            const { data, error } = await supabase
                .from('entry')
                .select('*');

            if (error) {
                console.error('Error fetching feedback:', error);
                return;
            }

            // Group feedback by sections
            const groupedFeedback = data.reduce((acc, entry) => {
                const { section } = entry;
                if (!acc[section]) acc[section] = [];
                acc[section].push(entry);
                return acc;
            }, {});

            setFeedbackData(groupedFeedback); // Update state with grouped data
        };
        fetchFeedback();



    }, [courseId]);

    return (
        <div>
            <h1>{courseId}</h1>

            {Object.keys(feedbackData).map((section) => (
                <div key={section} className="section">
                    {feedbackData[section].map((entry, index) => (
                        <section key={index} className="feedback-entry">
                            <p><strong>User:</strong> {entry.user_id}</p>
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
