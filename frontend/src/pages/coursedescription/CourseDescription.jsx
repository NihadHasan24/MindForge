import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { fetchUser } = UserData();
  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

  useEffect(() => {
    fetchCourse(params.id);
  }, []);

  const enrollHandler = async () => {
    if (!user) {
      return navigate('/login');
    }

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/course/checkout/${params.id}`,
        {},
        {
          headers: {
            token,
          },
        }
      );

      if (data.redirectUrl) {
        // For free courses
        await fetchUser();
        await fetchCourses();
        await fetchMyCourse();
        toast.success("Enrolled in free course successfully");
        navigate(data.redirectUrl);
      } else {
        // For paid courses
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && (
            <div className="course-description">
              <div className="course-header">
                <img
                  src={`${server}/${course.image}`}
                  alt=""
                  className="course-image"
                />
                <div className="course-info">
                  <h2>{course.title}</h2>
                  <p>Instructor: {course.createdBy}</p>
                  <p>Duration: {course.duration} weeks</p>
                  <p>{course.isFree ? 'This course is free' : `Price: $${course.price}`}</p>
                </div>
              </div>

              <p>{course.description}</p>

              {user && user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button onClick={enrollHandler} disabled={loading} className="common-btn">
                  {loading ? "Processing..." : (course.isFree ? "Enroll for Free" : "Buy Now")}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CourseDescription;
// import React, { useEffect, useState } from "react";
// import "./coursedescription.css";
// import { useNavigate, useParams } from "react-router-dom";
// import { CourseData } from "../../context/CourseContext";
// import { server } from "../../main";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { UserData } from "../../context/UserContext";
// import Loading from "../../components/loading/Loading";


// const CourseDescription = ({ user }) => {
//   const params = useParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);

//   const { fetchUser } = UserData();

//   const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

//   useEffect(() => {
//     fetchCourse(params.id);
//   }, []);

//   const checkoutHandler = async () => {
//     const token = localStorage.getItem("token");
//     setLoading(true);

//     try {
//       const { data } = await axios.post(
//         `${server}/api/course/checkout/${params.id}`,
//         {},
//         {
//           headers: {
//             token,
//           },
//         }
//       );

//       // Redirect to the SSL Commerz payment gateway
//       window.location.href = data.url;
//     } catch (error) {
//       toast.error(error.response.data.message);
//       setLoading(false);
//     }
//   };
//   return (
//     <>
//       {loading ? (
//         <Loading />
//       ) : (
//         <>
//           {course && (
//             <div className="course-description">
//               <div className="course-header">
//                 <img
//                   src={`${server}/${course.image}`}
//                   alt=""
//                   className="course-image"
//                 />
//                 <div className="course-info">
//                   <h2>{course.title}</h2>
//                   <p>Instructor: {course.createdBy}</p>
//                   <p>Duration: {course.duration} weeks</p>
//                 </div>
//               </div>

//               <p>{course.description}</p>

//               <p>Let's get started with course At {course.price}</p>

//               {user && user.subscription.includes(course._id) ? (
//                 <button
//                   onClick={() => navigate(`/course/study/${course._id}`)}
//                   className="common-btn"
//                 >
//                   Study
//                 </button>
//               ) : (
//                 <button onClick={checkoutHandler} className="common-btn">
//                   Buy Now
//                 </button>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </>
//   );
// };

// export default CourseDescription;