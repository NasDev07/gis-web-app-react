import React from 'react';

const LegendPanel = ({ visible }) => {
    const legendItems = [
        { color: "#4CAF50", label: "Residential Area" },
        { color: "#2196F3", label: "Commercial Zone" },
        { color: "#FF9800", label: "Industrial Area" },
        { color: "#9C27B0", label: "Public Facilities" },
        { color: "#607D8B", label: "Transportation" }
    ];

    return (
        <div className={`legend-panel ${visible ? 'visible' : ''}`}>
            <div className="legend-title">Map Legend</div>
            {legendItems.map((item, index) => (
                <div key={index} className="legend-item">
                    <div
                        className="legend-color"
                        style={{ backgroundColor: item.color }}
                    ></div>
                    <span style={{ color: '#333', fontWeight: '500' }}>
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default LegendPanel;