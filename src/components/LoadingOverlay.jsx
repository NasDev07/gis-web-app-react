import React from 'react';

const LoadingOverlay = ({ visible }) => {
    return (
        <div className={`loading-overlay ${visible ? 'visible' : ''}`}>
            <div className="spinner"></div>
            Loading map data...
        </div>
    );
};

export default LoadingOverlay;