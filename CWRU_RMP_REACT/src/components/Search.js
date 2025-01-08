import React, { useState } from "react";
import { supabase } from '../supabaseClient';
import '../css/Search.css';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState('professor'); // default to professor
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchType === "course") {
      await handleSearchCourse();
    } else {
      await handleSearchProf();
    }
  };

  const handleSearchCourse = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('course_id')
      .ilike('course_id', `%${searchTerm.replace(/\s+/g, '')}%`);

    if (error) {
      console.error("Error fetching courses:", error);
    } else {
      setResults(data);
    }
  };

  const handleSearchProf = async () => {
    const { data, error } = await supabase
      .from('professors')
      .select('first_name, last_name')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);

    if (error) {
      console.error("Error fetching professors:", error);
    } else {
      setResults(data);
    }
  };

  // Card click handlers
  const handleCourseCardClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleProfessorCardClick = (first_name, last_name) => {
    const formattedName = `${first_name}-${last_name}`;
    navigate(`/professor/${formattedName}`);
  };

  // Trigger search on Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-page">
      <h1 className="search-title">CWRU - Rate My Professor</h1>

      {/* Toggle text to pick search type */}
      <div className="search-type-toggle">
        <p
          className={`toggle-option ${searchType === 'professor' ? 'active' : ''}`}
          onClick={() => setSearchType('professor')}
        >
          I'd like to look up a professor by name
        </p>
        <p
          className={`toggle-option ${searchType === 'course' ? 'active' : ''}`}
          onClick={() => setSearchType('course')}
        >
          I'd like to search by course
        </p>
      </div>

      {/* Search input and button */}
      <div className="search-container">
        <input
          type="text"
          placeholder={`Search for a ${searchType === 'professor' ? 'professor' : 'course ID'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Results */}
      <div className="results-container">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div
              key={index}
              className="result-card"
              onClick={() => {
                if (searchType === "course") {
                  handleCourseCardClick(result.course_id);
                } else {
                  handleProfessorCardClick(result.first_name, result.last_name);
                }
              }}
            >
              {searchType === "course"
                ? result.course_id
                : `${result.first_name} ${result.last_name}`}
            </div>
          ))
        ) : (
          <p className="no-results">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Search;