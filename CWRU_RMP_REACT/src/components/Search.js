//search for courses 
import React, { useState } from "react";
import { supabase } from '../supabaseClient'
import '../css/Search.css';
import { useNavigate } from 'react-router-dom';


const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState('professor'); // "professor" or "course"
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (searchType === "course"){
      handleSearchCourse();
    }else{
      handleSearchProf();
    }
  }

  const handleSearchCourse = async () => {
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


  const handleSearchProf = async () => {
    // For now, we'll just leave the results as empty placeholders
    const { data, error } = await supabase
      .from('professors')
      .select('first_name, last_name')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);

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

  const handleToggle = () => {
    setSearchType((prevType) => (prevType === 'professor' ? 'course' : 'professor'));
    setResults([]);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch(); 
    }
};
  

  return (
    <div className="search-page">
      <h1>CWRU-RMP</h1>
      <div className="search-container">
      <button onClick={handleToggle}>
          Search by {searchType === 'professor' ? 'Course' : 'Professor'} instead
        </button>
        
        <input
          type="text"
          placeholder={`Search for ${searchType === 'professor' ? 'professor name' : 'course ID'}...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
          }}
          onKeyDown={handleKeyPress}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>
      <div className="results-container">
        {results.length > 0 ? (
          results.map((result, index) => (
            <button
              key={index}
              className="result-card"
              onClick={() =>
                handleCardClick(searchType === "course" ? result.course_id : `${result.first_name} ${result.last_name}`)
              }
            >
              {searchType === "course"
                ? result.course_id
                : `${result.first_name} ${result.last_name}`}
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