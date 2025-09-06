
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../../main';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await axios.get(`${server}/api/user/certificates`, {
        headers: { token: localStorage.getItem('token') },
      });
      setCertificates(data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  return (
    <div className="certificates-section">
      <h2>My Certificates</h2>
      {certificates.length > 0 ? (
        <ul className="certificate-list">
          {certificates.map((cert) => (
            <li key={cert._id} className="certificate-item">
              <h3>
                {cert.quiz ? (
                  <>Quiz: {cert.quiz.title} (Course: {cert.course?.title})</>
                ) : (
                  <>Certificate</>
                )}
              </h3>
              <p>Issued on: {new Date(cert.issueDate).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't earned any certificates yet. Get full marks in a premium course quiz to earn one.</p>
      )}
    </div>
  );
};

export default Certificates;