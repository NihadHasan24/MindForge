
// import React, { useEffect, useState } from 'react';
// import { useParams, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import { server } from '../../main';

// const PaymentSuccess = () => {
//   const [status, setStatus] = useState('processing');
//   const { courseId } = useParams();
//   const location = useLocation();

//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const paymentStatus = queryParams.get('status');
//     const tran_id = queryParams.get('tran_id');
//     const val_id = queryParams.get('val_id');

//     if (paymentStatus === 'success' && tran_id && val_id) {
//       verifyPayment(tran_id, val_id);
//     } else {
//       setStatus('failed');
//     }
//   }, [location]);

//   const verifyPayment = async (tran_id, val_id) => {
//     try {
//       const response = await axios.post(`${server}/api/payment/verify/${courseId}`, { tran_id, val_id });
//       if (response.data.success) {
//         setStatus('success');
//       } else {
//         setStatus('failed');
//       }
//     } catch (error) {
//       console.error('Error verifying payment:', error);
//       setStatus('failed');
//     }
//   };

//   return (
//     <div>
//       {status === 'processing' && <p>Processing your payment...</p>}
//       {status === 'success' && <p>Payment successful! You can now access the course.</p>}
//       {status === 'failed' && <p>Payment failed. Please try again.</p>}
//     </div>
//   );
// };

// export default PaymentSuccess;
import React from "react";
import "./paymentsuccess.css";
import { Link, useParams } from "react-router-dom";

const PaymentSuccess = ({ user }) => {
  const params = useParams();
  const { fetchUser } = UserData();
  const { fetchCourses, fetchMyCourse } = CourseData();
  useEffect(() => {
    const updateData = async () => {
      await fetchUser();
      await fetchCourses();
      await fetchMyCourse();
    };
    updateData();
  }, []);
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