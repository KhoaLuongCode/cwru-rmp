// src/components/ProfessorPage.js

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import "../css/Search.css";

export default function ProfessorPage({ session }) {
    const { professorId } = useParams();
    const [feedbackData, setFeedbackData] = useState({});
    const [averageQuality, setAverageQuality] = useState(0);
    const [averageDifficulty, setAverageDifficulty] = useState(0);
    const [userVotes, setUserVotes] = useState({}); 
    const [user, setUser] = useState(null); 
    const [reportReason, setReportReason] = useState('');
    const [reportingEntryId, setReportingEntryId] = useState(null);

    // Fetch the current user
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
            } else {
                setUser(user);
            }
        };

        fetchUser();
    }, []);

    const fetchFeedback = useCallback(async () => {
        if (!user) {
            // User not authenticated
            return;
        }


        // Fetch data from Supabase
        const { data, error } = await supabase
            .from('entry')
            .select('*, profiles!fk_user(username)')
            .eq('professor_name', professorId.replace(/-/g, ' '));

        if (error) {
            console.error('Error fetching feedback:', error);
            return;
        }
        console.log('Fetched data:', data);

        if (data.length === 0) {
            setFeedbackData({});
            setAverageQuality(0);
            setAverageDifficulty(0);
            setUserVotes({});
            return;
        }

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

        // Fetch user votes for these entries
        const entryIds = sortedData.map(entry => entry.entry_id);
        const { data: votesData, error: votesError } = await supabase
            .from('votes')
            .select('entry_id, vote_type')
            .in('entry_id', entryIds)
            .eq('user_id', user.id);

        if (votesError) {
            console.error('Error fetching user votes:', votesError);
            return;
        }

        // Create a map of entry_id to vote_type
        const votesMap = {};
        votesData.forEach(vote => {
            votesMap[vote.entry_id] = vote.vote_type;
        });

        setUserVotes(votesMap);
    }, [professorId, user]);

    useEffect(() => {
        document.title = `Professor: ${professorId}`;
        fetchFeedback();
        console.log('User is logged in:', session.user);
    }, [professorId, user, fetchFeedback]);

    // Helper function to update feedbackData optimistically
    const updateFeedbackData = (entryId, type) => {
        setFeedbackData(prevData => {
            const newData = { ...prevData };
            for (const section in newData) {
                newData[section] = newData[section].map(entry => {
                    if (entry.entry_id === entryId) {
                        let updatedEntry = { ...entry };
                        if (type === 'upvote') {
                            updatedEntry.upvote += 1;
                            if (entry.vote_type === 'downvote') {
                                updatedEntry.downvote -= 1;
                            }
                        } else if (type === 'downvote') {
                            updatedEntry.downvote += 1;
                            if (entry.vote_type === 'upvote') {
                                updatedEntry.upvote -= 1;
                            }
                        } else if (type === 'undo_upvote') {
                            updatedEntry.upvote -= 1;
                        } else if (type === 'undo_downvote') {
                            updatedEntry.downvote -= 1;
                        }
                        return updatedEntry;
                    }
                    return entry;
                });
            }
            return newData;
        });
    };

    // Function to handle upvote
    const handleUpvote = async (entryId, currentUpvotes, currentDownvotes) => {
        if (!user) {
            alert('You must be logged in to vote.');
            return;
        }

        const currentVote = userVotes[entryId];

        if (currentVote === 'upvote') {
            // Undo the upvote
            const { error: deleteError } = await supabase
                .from('votes')
                .delete()
                .eq('user_id', user.id)
                .eq('entry_id', entryId);

            if (deleteError) {
                console.error('Error removing upvote:', deleteError);
                return;
            }

            const { error: updateError } = await supabase
                .from('entry')
                .update({ upvote: currentUpvotes - 1 })
                .eq('entry_id', entryId);

            if (updateError) {
                console.error('Error updating upvote count:', updateError);
                return;
            }

            // Update local state
            setUserVotes(prevVotes => {
                const { [entryId]: _, ...rest } = prevVotes;
                return rest;
            });

            // Optimistically update feedbackData
            updateFeedbackData(entryId, 'undo_upvote');
        } else {
            // Add or change to upvote
            const { error: voteError } = await supabase
                .from('votes')
                .upsert([{ user_id: user.id, entry_id: entryId, vote_type: 'upvote' }]);

            if (voteError) {
                console.error('Error recording vote:', voteError);
                return;
            }

            const { error: updateError } = await supabase
                .from('entry')
                .update({ 
                    upvote: currentUpvotes + 1, 
                    downvote: currentVote === 'downvote' ? currentDownvotes - 1 : currentDownvotes 
                })
                .eq('entry_id', entryId);

            if (updateError) {
                console.error('Error updating upvote count:', updateError);
                return;
            }

            // Update local state
            setUserVotes(prevVotes => ({ ...prevVotes, [entryId]: 'upvote' }));

            // Optimistically update feedbackData
            if (currentVote === 'downvote') {
                updateFeedbackData(entryId, 'upvote');
            } else {
                updateFeedbackData(entryId, 'upvote');
            }
        }
    };

    // Function to handle downvote
    const handleDownvote = async (entryId, currentDownvotes, currentUpvotes) => {
        if (!user) {
            alert('You must be logged in to vote.');
            return;
        }

        const currentVote = userVotes[entryId];

        if (currentVote === 'downvote') {
            // Undo the downvote
            const { error: deleteError } = await supabase
                .from('votes')
                .delete()
                .eq('user_id', user.id)
                .eq('entry_id', entryId);

            if (deleteError) {
                console.error('Error removing downvote:', deleteError);
                return;
            }

            const { error: updateError } = await supabase
                .from('entry')
                .update({ downvote: currentDownvotes - 1 })
                .eq('entry_id', entryId);

            if (updateError) {
                console.error('Error updating downvote count:', updateError);
                return;
            }

            // Update local state
            setUserVotes(prevVotes => {
                const { [entryId]: _, ...rest } = prevVotes;
                return rest;
            });

            // Optimistically update feedbackData
            updateFeedbackData(entryId, 'undo_downvote');
        } else {
            // Add or change to downvote
            const { error: voteError } = await supabase
                .from('votes')
                .upsert([{ user_id: user.id, entry_id: entryId, vote_type: 'downvote' }]);

            if (voteError) {
                console.error('Error recording vote:', voteError);
                return;
            }

            const { error: updateError } = await supabase
                .from('entry')
                .update({ 
                    downvote: currentDownvotes + 1, 
                    upvote: currentVote === 'upvote' ? currentUpvotes - 1 : currentUpvotes 
                })
                .eq('entry_id', entryId);

            if (updateError) {
                console.error('Error updating downvote count:', updateError);
                return;
            }

            // Update local state
            setUserVotes(prevVotes => ({ ...prevVotes, [entryId]: 'downvote' }));

            // Optimistically update feedbackData
            if (currentVote === 'upvote') {
                updateFeedbackData(entryId, 'downvote');
            } else {
                updateFeedbackData(entryId, 'downvote');
            }
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
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' });
    };

    return (
        <div className="search-page">
            <h1>{professorId}</h1>
            <div className="averages">
                <h2>Average Quality: {averageQuality.toFixed(2)}</h2>
                <h2>Average Difficulty: {averageDifficulty.toFixed(2)}</h2>
            </div>

            {Object.keys(feedbackData).map((section) => (
                <div key={section} className="section">
                    {feedbackData[section].map((entry) => (
                        <div key={entry.entry_id} className="result-card">
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
                                    <p><strong>Semester:</strong> {entry.semester}</p>
                                </div>
                                <p className="comment"><strong>Comment:</strong> {entry.comment}</p>
                                <p><strong>Textbook:</strong> {entry.textbook}</p>
                                <p><strong>Extra Credit:</strong> {entry.extra_credit ? "Yes" : "No"}</p>
                                <p><strong>Study Tips:</strong> {entry.study_tips}</p>
                                <p>{formatDate(entry.submitted_at)}</p>
                            </div>
                            <div className="vote-buttons">
                                <button
                                    className={userVotes[entry.entry_id] === 'upvote' ? 'upvoted' : ''}
                                    onClick={() => handleUpvote(entry.entry_id, entry.upvote, entry.downvote)}
                                >
                                    ↑ Upvote ({entry.upvote})
                                </button>
                                <button
                                    className={userVotes[entry.entry_id] === 'downvote' ? 'downvoted' : ''}
                                    onClick={() => handleDownvote(entry.entry_id, entry.downvote, entry.upvote)}
                                >
                                    ↓ Downvote ({entry.downvote})
                                </button>
                            </div>
                            {userVotes[entry.entry_id] && (
                                <p className="vote-status">
                                    You have {userVotes[entry.entry_id]}d this entry.
                                </p>
                            )}
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


