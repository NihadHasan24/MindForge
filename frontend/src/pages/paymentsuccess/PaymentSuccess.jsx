
import React, { useEffect } from "react";
import "./paymentsuccess.css";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { CourseData } from "../../context/CourseContext";

const PaymentSuccess = ({ user }) => {
  const params = useParams();
  const location = useLocation();
  const { fetchUser } = UserData();
  const { fetchCourses, fetchMyCourse } = CourseData();

  useEffect(() => {
    const updateData = async () => {
      const queryParams = new URLSearchParams(location.search);
      const status = queryParams.get('status');
      const tran_id = queryParams.get('tran_id');
      const val_id = queryParams.get('val_id');
      const session_id = queryParams.get('session_id');

      if (status === 'success') {
        try {
          const token = localStorage.getItem('token');
          if (session_id) {
            await axios.get(`${server}/api/stripe/success?session_id=${session_id}&courseId=${params.id}`, { headers: { token } });
          } else if (tran_id && val_id) {
            await axios.post(`${server}/api/payment/verify/${params.id}`, { tran_id, val_id }, { headers: { token } });
          }
        } catch (e) {}
      }

      await fetchUser();
      await fetchCourses();
      await fetchMyCourse();
    };
    updateData();
  }, [location]);
  return (
    <div className="payment-success-page">
      {user && (
        <div className="success-message">
          <h2>Payment successful</h2>
          <p>Your course subscription has been activated</p>
          <p>Reference no - {params.id}</p>
          <Link to={`/${user._id}/dashboard`} className="common-btn">
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;