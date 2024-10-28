//search for courses 
import React, { useState } from "react";
import { supabase } from './supabaseClient'
import './Search.css'
import { useNavigate } from 'react-router-dom';


const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);


  const handleSearch = async () => {
    // For now, we'll just leave the results as empty placeholders
    const { data, error } = await supabase
      .from('courses')
      .select('course_id')
      .ilike('course_id', `%${searchTerm.replace(/\s+/g, '')}%`);

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setResults(data);
    }
  };

  const navigate = useNavigate();

  const handleCardClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };
  



  return (
    <div className="search-page">
      <h1>CWRU-RMP</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for professor name or course id..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
          }}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>
      <div className="results-container">
        {results.length > 0 ? (
          results.map((result, index) => (
            <button
              key={index}
              className="result-card"
              onClick={() => handleCardClick(result.course_id)} // Call the function with course_id
            >
              {result.course_id}
            </button>
          ))
        ) : (
          <button className="result-card">No results</button>
        )}
      </div>
    </div>
  );
};

export default Search;