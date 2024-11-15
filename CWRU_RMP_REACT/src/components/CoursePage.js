import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import "../css/Search.css";

const CoursePage = () => {
    const { courseId } = useParams();
    const [feedbackData, setFeedbackData] = useState({});
    const [averageQuality, setAverageQuality] = useState(0);
    const [averageDifficulty, setAverageDifficulty] = useState(0);

    // Move fetchFeedback outside useEffect to make it accessible in upvote/downvote handlers
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

        // Sort feedback data by submitted_at (most recent first)
        const sortedData = data.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

        // Group feedback by sections
        const groupedFeedback = sortedData.reduce((acc, entry) => {
            const { section } = entry;
            if (!acc[section]) acc[section] = [];
            acc[section].push(entry);
            return acc;
        }, {});

        setFeedbackData(groupedFeedback);
        const totalQuality = sortedData.reduce((acc, entry) => acc + entry.quality, 0);
        const totalDifficulty = sortedData.reduce((acc, entry) => acc + entry.difficulty, 0);

        setAverageQuality(totalQuality / sortedData.length);
        setAverageDifficulty(totalDifficulty / sortedData.length);
    };

    useEffect(() => {
        document.title = `Course: ${courseId}`;
        fetchFeedback();
    }, [courseId]);

    // Function to handle upvote
    const handleUpvote = async (entryId, currentUpvotes) => {
        const { error } = await supabase
            .from('entry')
            .update({ upvote: currentUpvotes + 1 })
            .eq('entry_id', entryId);

        if (error) {
            console.error('Error updating upvote:', error);
        } else {
            fetchFeedback(); // Refresh feedback data to show updated votes
        }
    };

    // Function to handle downvote
    const handleDownvote = async (entryId, currentDownvotes) => {
        const { error } = await supabase
            .from('entry')
            .update({ downvote: currentDownvotes + 1 })
            .eq('entry_id', entryId);

        if (error) {
            console.error('Error updating downvote:', error);
        } else {
            fetchFeedback(); // Refresh feedback data to show updated votes
        }
    };

    // Function to format the submitted_at timestamp (Month, Year)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

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
                            <p><strong>Workload:</strong> {entry.workload}</p>
                            <p><strong>Submitted At:</strong> {formatDate(entry.submitted_at)}</p> {/* Display formatted date */}
                            <div className="vote-buttons">
                                <button onClick={() => handleUpvote(entry.entry_id, entry.upvote)}>
                                    👍 Upvote ({entry.upvote})
                                </button>
                                <button onClick={() => handleDownvote(entry.entry_id, entry.downvote)}>
                                    👎 Downvote ({entry.downvote})
                                </button>
                            </div>
                        </section>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default CoursePage;
