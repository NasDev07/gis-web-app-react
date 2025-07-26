import React from 'react';

const StatusBar = ({ coordinates, zoom }) => {
    return (
        <div className="status-bar">
            <div>
                <span>Ready</span>
                <span style={{ marginLeft: '20px' }}>
                    Scale: 1:{Math.round(100000 / zoom)}
                </span>
            </div>
            <div className="coordinates">
                Coordinates: {coordinates.x}, {coordinates.y}
            </div>
        </div>
    );
};

export default StatusBar;