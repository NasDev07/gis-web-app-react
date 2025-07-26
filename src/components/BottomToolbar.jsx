import React from 'react';

const BottomToolbar = ({ tools, activeToolIndex, onToolClick }) => {
    return (
        <div className="bottom-toolbar">
            {tools.map((tool, index) => (
                <button
                    key={index}
                    className={`tool-btn ${activeToolIndex === index ? 'active' : ''}`}
                    onClick={() => onToolClick(index)}
                    title={tool.tooltip}
                >
                    {tool.icon}
                    <div className="tooltip">{tool.tooltip}</div>
                </button>
            ))}
        </div>
    );
};

export default BottomToolbar;