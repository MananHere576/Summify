import React from 'react';
import { ThreeDot } from 'react-loading-indicators';

function Preloader() {
  return (
    <div className="preloader">
      <div className="preloader-content">
        {}
        <h1 className="preloader-title">Summify - Document Summary Assistant</h1>

        {}
        <ThreeDot
          variant="bounce"
          color="#8B0000"
          size="large"
          textColor="#000000"
        />
      </div>
    </div>
  );
}

export default Preloader;