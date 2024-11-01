import React from 'react';
import { motion } from 'framer-motion';
import './Dashboard.css';

function Dashboard() {
  const handleNhahangNext = () => {
    window.location.href = "/resource/foodservice/Owner/index.html";
  };
  const handleMarketingNext = () => {
    window.location.href = "/resource/marketing/owner/index.html";
  };

  return (
    <div className="dashboard-container container">
      <div className="cards-container row gy-5">
        {[
          { title: 'Marketing', onClick: handleMarketingNext },
          { title: 'Nhà Hàng', onClick: handleNhahangNext },
          { title: 'Khách sạn', onClick: () => { } },
          { title: 'Web Shopping', onClick: () => { } },
        ].map((card, index) => (
          <motion.div
            className="cards col-12"
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <h2>{card.title}</h2>
            <button className="next-button" onClick={card.onClick}>Next</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
