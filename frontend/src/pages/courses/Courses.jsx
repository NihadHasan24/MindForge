import React, { useEffect, useState } from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";

const Courses = () => {
  const { courses, fetchCourses } = CourseData();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [isFree, setIsFree] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const applyFilters = () => {
    const qLower = (q || '').toLowerCase().trim();
    let effectiveIsFree = isFree;
    if (!isFree && (qLower === 'premium' || qLower === 'paid')) effectiveIsFree = 'false';
    if (!isFree && qLower === 'free') effectiveIsFree = 'true';
    fetchCourses({ q, category, isFree: effectiveIsFree, minPrice, maxPrice });
  };

  console.log(courses);
  return (
    <div className="courses">
      <h2>Available Courses</h2>

      <div className="course-filters">
        <input
          type="text"
          placeholder="Search by title, instructor, category..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <select value={isFree} onChange={(e) => setIsFree(e.target.value)}>
          <option value="">All</option>
          <option value="true">Free</option>
          <option value="false">Premium</option>
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          min="0"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          min="0"
        />
        <button className="common-btn" onClick={applyFilters}>Search</button>
      </div>

      <div className="course-container">
        {courses && courses.length > 0 ? (
          courses.map((e) => <CourseCard key={e._id} course={e} />)
        ) : (
          <p>No Courses Yet!</p>
        )}
      </div>
    </div>
  );
};

export default Courses;