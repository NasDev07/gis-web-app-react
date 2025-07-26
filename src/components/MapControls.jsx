import React from 'react';

const MapControls = ({ onZoomIn, onZoomOut }) => {
    return (
        <div className="map-controls">
            <button className="control-btn" onClick={onZoomIn} title="Zoom In">
                +
            </button>
            <button className="control-btn" onClick={onZoomOut} title="Zoom Out">
                −
            </button>
        </div>
    );
};

export default MapControls;