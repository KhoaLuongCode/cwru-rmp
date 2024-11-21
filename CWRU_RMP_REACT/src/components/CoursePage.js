// src/components/CoursePage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import "../css/Search.css";

export default function CoursePage({ session }) {
    const { courseId } = useParams();
    const [feedbackData, setFeedbackData] = useState({});
    const [averageQuality, setAverageQuality] = useState(0);
    const [averageDifficulty, setAverageDifficulty] = useState(0);
    const [reportReason, setReportReason] = useState('');
    const [reportingEntryId, setReportingEntryId] = useState(null);

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
        console.log('User is logged in:', session.user);
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


    const handleReportSubmit = async (closePopup) => {
        if (!reportReason.trim()) {
            alert('Please provide a reason for reporting.');
            return;
        }

        const { error } = await supabase
            .from('reported')
            .insert([{ entry_id: reportingEntryId, reason: reportReason, user_id: session.user.id }]);

            //TODO: fix alert(toast)
        if (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit the report. Please try again.');
        } else {
            alert('Report submitted successfully.');
            closePopup();
            setReportReason('');
        }
    };

    // Function to format the submitted_at timestamp (Month, Year) in UTC
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: undefined, timeZone: 'UTC' });
    };

    return (
        <div className="search-page">
            <h1>{courseId}</h1>
            <div className="averages">
                <h2>Average Quality: {averageQuality.toFixed(2)}</h2>
                <h2>Average Difficulty: {averageDifficulty.toFixed(2)}</h2>
            </div>

            {Object.keys(feedbackData).map((section) => (
                <div key={section} className="section">
                    {feedbackData[section].map((entry, index) => (
                        <div key={index} className="result-card">
                            <div className="entry-header">
                                <h3>{entry.profiles.username}</h3>
                                <span className="course-id">{entry.course_id}</span>
                            </div>
                            <div className="entry-body">
                                <p><strong>Professor:</strong> {entry.professor_name}</p>
                                <div className="ratings">
                                    <p><strong>Quality:</strong> {entry.quality}</p>
                                    <p><strong>Difficulty:</strong> {entry.difficulty}</p>
                                    <p><strong>Workload:</strong> {entry.workload}</p>
                                </div>
                                <p className="comment"><strong>Comment:</strong> {entry.comment}</p>
                                <p><strong>Submitted At:</strong> {formatDate(entry.submitted_at)}</p>
                            </div>
                            <div className="vote-buttons">
                                <button onClick={() => handleUpvote(entry.entry_id, entry.upvote)}>
                                    ↑ Upvote ({entry.upvote})
                                </button>
                                <button onClick={() => handleDownvote(entry.entry_id, entry.downvote)}>
                                    ↓ Downvote ({entry.downvote})
                                </button>
                            </div>
                            <div className="report-button">
                                <Popup
                                    trigger={<button>Report Post</button>}
                                    modal
                                    nested
                                    onOpen={() => setReportingEntryId(entry.entry_id)}
                                >
                                    {(close) => (
                                        <div className="modal">
                                            <h2>Report Post</h2>
                                            <textarea
                                                placeholder="Enter your reason for reporting this post..."
                                                value={reportReason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                            />
                                            <div className="form-buttons">
                                                <button onClick={() => handleReportSubmit(close)}>Submit</button>
                                                <button onClick={() => {
                                                    close(); // Call the close function passed by Popup
                                                    setReportReason(''); // Reset the report reason
                                                }}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </Popup>

                            </div>
                        </div>
                    ))}
                </div>
            ))}

        </div>
    );
};


