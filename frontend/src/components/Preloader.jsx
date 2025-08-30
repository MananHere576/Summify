import React from 'react';
import { ThreeDot } from 'react-loading-indicators';

function Preloader() {
  return (
    <div className="preloader">
      <div className="preloader-content">
        {/* The title on top */}
        <h1 className="preloader-title">Summify - Document Summary Assistant</h1>

        {/* The animation below */}
        <ThreeDot
          variant="bounce"
          color="#4a90e2"
          size="large"
          textColor="#000000"
        />
      </div>
    </div>
  );
}

export default Preloader;