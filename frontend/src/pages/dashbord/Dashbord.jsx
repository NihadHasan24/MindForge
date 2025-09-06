// import React from "react";
// import "./dashbord.css";
// import { CourseData } from "../../context/CourseContext";
// import CourseCard from "../../components/coursecard/CourseCard";
// import { Link } from 'react-router-dom';
// import { QuizData } from '../../context/QuizContext';


import React, { useEffect, useState } from "react";
import "./dashbord.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import { Link } from 'react-router-dom';
import { QuizData } from '../../context/QuizContext';
import { UserData } from "../../context/UserContext";
import axios from 'axios';
import { server } from "../../main";

const Dashbord = () => {
  const { mycourse } = CourseData();
  const { quizzes, fetchQuizzes } = QuizData();
  const { user } = UserData();
  const [certificates, setCertificates] = useState([]);
  const freeCourses = (mycourse || []).filter((c) => c.isFree || Number(c.price) === 0);
  const premiumCourses = (mycourse || []).filter((c) => c.isPremiumForUser || (!c.isFree && Number(c.price) > 0));

  useEffect(() => {
    fetchQuizzes();
    fetchCertificates();
  }, [fetchQuizzes]);

  const fetchCertificates = async () => {
    try {
      const { data } = await axios.get(`${server}/api/certificates`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setCertificates(data.certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const downloadCertificate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${server}/api/certificate/quiz/${id}/pdf`, {
        headers: { token },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  return (
    <div className="student-dashboard">
      <h2>Enrolled Courses</h2>
      <h3>Free Courses</h3>
      <div className="dashboard-content">
        {freeCourses && freeCourses.length > 0 ? (
          freeCourses.map((e) => <CourseCard key={e._id} course={e} />)
        ) : (
          <p>No free courses enrolled yet</p>
        )}
      </div>

      <h3>Premium Courses</h3>
      <div className="dashboard-content">
        {premiumCourses && premiumCourses.length > 0 ? (
          premiumCourses.map((e) => <CourseCard key={e._id} course={e} />)
        ) : (
          <p>No premium courses enrolled yet</p>
        )}
      </div>

      <div className="available-quizzes">
        <h3>Available Quizzes</h3>
        {quizzes && quizzes.length > 0 ? (
          <ul>
            {quizzes.map((quiz) => (
              <li key={quiz._id}>
                <Link to={`/quiz/${quiz._id}`}>{quiz.title}</Link>
                {quiz.course && <span> - {quiz.course.title}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No quizzes available</p>
        )}
      </div>

      {user && user.quizResults && user.quizResults.length > 0 && (
        <div className="quiz-results">
          <h3>Your Quiz Results</h3>
          <ul>
            {user.quizResults.map((result, index) => (
              <li key={index}>
                {result.quiz.title}: {result.score}/{result.totalQuestions}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="certificates-section">
        <h3>Your Certificates</h3>
        {certificates.length > 0 ? (
          <ul className="certificate-list">
            {certificates.map((cert) => (
              <li key={cert._id} className="certificate-item">
                <h4>
                  {cert.quiz ? (
                    <>Quiz: {cert.quiz.title} (Course: {cert.course?.title})</>
                  ) : (
                    <>Certificate</>
                  )}
                </h4>
                <p>Issued on: {new Date(cert.issueDate).toLocaleDateString()}</p>
                {cert._id && (
                  <button
                    onClick={() => downloadCertificate(cert._id)}
                    className="common-btn"
                  >
                    Download PDF
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't earned any certificates yet. Get full marks in a premium course quiz to earn one.</p>
        )}
      </div>
    </div>
  );
};

export default Dashbord;
// import React, { useEffect } from "react";
// import "./dashbord.css";
// import { CourseData } from "../../context/CourseContext";
// import CourseCard from "../../components/coursecard/CourseCard";
// import { Link } from 'react-router-dom';
// import { QuizData } from '../../context/QuizContext';
// import { UserData } from "../../context/UserContext";


// const Dashbord = () => {
//   const { mycourse } = CourseData();
//   const { quizzes, fetchQuizzes } = QuizData();
//   const { user } = UserData();

//   useEffect(() => {
//     fetchQuizzes();
//   }, [fetchQuizzes]);

//   return (
//     <div className="student-dashboard">
//       <h2>All Enrolled Courses</h2>
//       <div className="dashboard-content">
//         {mycourse && mycourse.length > 0 ? (
//           mycourse.map((e) => <CourseCard key={e._id} course={e} />)
//         ) : (
//           <p>No course Enrolled Yet</p>
//         )}
//       </div>

//       <div className="available-quizzes">
//         <h3>Available Quizzes</h3>
//         {quizzes && quizzes.length > 0 ? (
//           <ul>
//             {quizzes.map((quiz) => (
//               <li key={quiz._id}>
//                 <Link to={`/quiz/${quiz._id}`}>{quiz.title}</Link>
//                 {quiz.course && <span> - {quiz.course.title}</span>}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No quizzes available</p>
//         )}
//       </div>

//       {user && user.quizResults && user.quizResults.length > 0 && (
//         <div className="quiz-results">
//           <h3>Your Quiz Results</h3>
//           <ul>
//             {user.quizResults.map((result, index) => (
//               <li key={index}>
//                 {result.quiz.title}: {result.score}/{result.totalQuestions}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashbord;


// const Dashbord = () => {
//   const { mycourse } = CourseData();
//   return (
//     <div className="student-dashboard">
//       <h2>All Enrolled Courses</h2>
//       <div className="dashboard-content">
//         {mycourse && mycourse.length > 0 ? (
//           mycourse.map((e) => <CourseCard key={e._id} course={e} />)
//         ) : (
//           <p>No course Enrolled Yet</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashbord;