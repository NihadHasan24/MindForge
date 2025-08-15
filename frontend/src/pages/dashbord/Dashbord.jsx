// import React from "react";
// import "./dashbord.css";
// import { CourseData } from "../../context/CourseContext";
// import CourseCard from "../../components/coursecard/CourseCard";
// import { Link } from 'react-router-dom';
// import { QuizData } from '../../context/QuizContext';

import React, { useEffect, useState } from "react";
import { CourseData } from "../../context/CourseContext";
import { Link } from 'react-router-dom';
import { UserData } from "../../context/UserContext";
import { QuizData } from '../../context/QuizContext';
import CourseCard from "../../components/coursecard/CourseCard";
import axios from "axios";
import { server } from "../../main";
import "./dashbord.css";

const Dashbord = () => {
  const { mycourse } = CourseData();
  const { quizzes, fetchQuizzes } = QuizData();
  const { user } = UserData();
  const [courseProgress, setCourseProgress] = useState({});

  useEffect(() => {
    fetchQuizzes();
    fetchAllProgress();
  }, [fetchQuizzes]);

  const fetchAllProgress = async () => {
    const progress = {};
    for (const course of mycourse) {
      try {
        const { data } = await axios.get(
          `${server}/api/user/progress?course=${course._id}`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        progress[course._id] = data.courseProgressPercentage;
      } catch (error) {
        console.log(error);
      }
    }
    setCourseProgress(progress);
  };

  const getMilestone = (progress) => {
    if (progress === 100) return "Course Completed! 🎉";
    if (progress >= 75) return "Almost there! 💪";
    if (progress >= 50) return "Halfway through! 🚀";
    if (progress >= 25) return "Great start! 👍";
    return "Just beginning 🌱";
  };

  return (
    <div className="student-dashboard">
      <h2>Your Learning Journey</h2>
      <div className="course-progress-container">
        {mycourse && mycourse.length > 0 ? (
          mycourse.map((course) => (
            <div key={course._id} className="course-progress-item">
              <h3>{course.title}</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${courseProgress[course._id] || 0}%`}}
                ></div>
              </div>
              <p className="progress-percentage">{courseProgress[course._id] || 0}% complete</p>
              <p className="milestone">{getMilestone(courseProgress[course._id] || 0)}</p>
              <Link to={`/course/study/${course._id}`} className="continue-btn">Continue Learning</Link>
            </div>
          ))
        ) : (
          <p>No courses enrolled yet. Start your learning journey today!</p>
        )}
      </div>

      <h2>All Enrolled Courses</h2>
      <div className="dashboard-content">
        {mycourse && mycourse.length > 0 ? (
          mycourse.map((e) => <CourseCard key={e._id} course={e} />)
        ) : (
          <p>No courses enrolled yet. Explore our course catalog!</p>
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
          <p>No quizzes available at the moment. Check back later!</p>
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