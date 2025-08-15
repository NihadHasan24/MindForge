
import React, { useEffect, useState } from "react";
import "./coursestudy.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";

const CourseStudy = ({ user }) => {
  const params = useParams();
  const { fetchCourse, course } = CourseData();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    if (user && user.role !== "admin" && !user.subscription.includes(params.id)) {
      navigate("/");
    } else {
      fetchCourse(params.id);
      fetchProgress();
    }
  }, [user, params.id]);

  const fetchProgress = async () => {
    try {
      const { data } = await axios.get(`${server}/api/course/progress/${params.id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setProgress(data.progressPercentage);
      if (data.certificate) {
        setCertificate(data.certificate);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const handleGetCertificate = async () => {
    try {
      const response = await axios.get(`${server}/api/certificate/generate/${params.id}`, {
        headers: { token: localStorage.getItem("token") },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificate.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  return (
    <div className="course-study-page">
      {course && (
        <>
          <div className="course-header">
            <img src={`${server}/${course.image}`} alt={course.title} className="course-image" />
            <div className="course-info">
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <p>Instructor: {course.createdBy}</p>
              <p>Duration: {course.duration} weeks</p>
            </div>
          </div>

          <div className="course-progress">
            <h3>Your Progress</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p>{progress.toFixed(2)}% Complete</p>
          </div>

          <div className="course-actions">
            <Link to={`/lectures/${course._id}`} className="btn btn-primary">
              Go to Lectures
            </Link>
            {progress === 100 && !certificate && (
              <button onClick={handleGetCertificate} className="btn btn-success">
                Get Certificate
              </button>
            )}
            {certificate && (
              <button onClick={handleGetCertificate} className="btn btn-info">
                Download Certificate
              </button>
            )}
          </div>

          <div className="course-outline">
            <h3>Course Outline</h3>
            {/* Add course outline or syllabus here */}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseStudy;
// import React, { useEffect } from "react";
// import "./coursestudy.css";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { CourseData } from "../../context/CourseContext";
// import { server } from "../../main";

// const CourseStudy = ({ user }) => {
//   const params = useParams();

//   const { fetchCourse, course } = CourseData();
//   const navigate = useNavigate();

//   if (user && user.role !== "admin" && !user.subscription.includes(params.id))
//     return navigate("/");

//   useEffect(() => {
//     fetchCourse(params.id);
//   }, []);
//   return (
//     <>
//       {course && (
//         <div className="course-study-page">
//           <img src={`${server}/${course.image}`} alt="" width={350} />
//           <h2>{course.title}</h2>
//           <h4>{course.description}</h4>
//           <h5>by - {course.createdBy}</h5>
//           <h5>Duration - {course.duration} weeks</h5>
//           <Link to={`/lectures/${course._id}`}>
//             <h2>Lectures</h2>
//           </Link>
//         </div>
//       )}
//     </>
//   );
// };

// export default CourseStudy;