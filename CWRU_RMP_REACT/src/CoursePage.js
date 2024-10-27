//displays search result for each course 
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CoursePage = () => {
    const { courseId } = useParams(); // Get courseId from the URL

    useEffect(() => {
        document.title = `Course: ${courseId}`;
    }, [courseId]);

    return (
        <div>
            <h1>{courseId}</h1>
            <section>
            </section>
        </div>
    );
};

export default CoursePage;
