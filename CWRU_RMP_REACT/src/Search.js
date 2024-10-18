import React, { useState } from "react";
import { supabase } from './supabaseClient'

const Search = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState(Array(5).fill(''));


    const handleSearch = async () => {
        // For now, we'll just leave the results as empty placeholders
        const { data, error } = await supabase
        .from('courses')
        .select('course_id')
        .ilike('course_id', `%${searchTerm}%`); 
  
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setResults(data);
      }
      };

return (
    <div className="search-page">
      <div className="search-container">
        <input 
          type="text"
          placeholder="Search..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value)}}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="results-container">
      {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="result-card">
              {JSON.stringify(result)} 
            </div>
          ))
        ) : (
          <div>No results</div>
        )}
      </div>
    </div>
  );
};

export default Search;