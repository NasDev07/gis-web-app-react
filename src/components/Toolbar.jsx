import React from 'react';

const Toolbar = () => {
    return (
        <div className="toolbar">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Window</span>
            <span>Help</span>
            
            <div className="window-controls">
                <div className="window-btn">−</div>
                <div className="window-btn">□</div>
                <div className="window-btn">×</div>
            </div>
        </div>
    );
};

export default Toolbar;