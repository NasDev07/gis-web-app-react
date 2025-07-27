import React, { useState, useEffect, useRef } from 'react';
import MapControls from './MapControls';
import LegendPanel from './LegendPanel';
import LoadingOverlay from './LoadingOverlay';
import mapImage from '/images.jpg';

const MapContainer = ({
    zoom, pan, setZoom, setPan,
    coordinates, setCoordinates,
    showLegend, isLoading,
    mainTools, hoverTools, toolbarPosition, showHoverTools,
    onMainToolClick, onToolbarToggle,
    activeToolIndex, setActiveToolIndex
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isToolboxOpen, setIsToolboxOpen] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawings, setDrawings] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [labels, setLabels] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    const mapRef = useRef(null);
    const svgRef = useRef(null);

    // Tool modes
    const TOOLS = {
        SELECTION: 0,
        AI_BUILDING: 1,
        PENCIL: 2,
        DELETE: 3,
        UNDO: 4,
        REDO: 5
    };

    const getCurrentTool = () => hoverTools[activeToolIndex];

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev * 1.2, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev / 1.2, 0.5));
    };

    const saveToHistory = () => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
            drawings: [...drawings],
            labels: [...labels],
            selectedAreas: [...selectedAreas]
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const previousState = history[historyIndex - 1];
            setDrawings(previousState.drawings);
            setLabels(previousState.labels);
            setSelectedAreas(previousState.selectedAreas);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setDrawings(nextState.drawings);
            setLabels(nextState.labels);
            setSelectedAreas(nextState.selectedAreas);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleMouseDown = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom - pan.x / zoom;
        const y = (e.clientY - rect.top) / zoom - pan.y / zoom;

        switch (activeToolIndex) {
            case TOOLS.SELECTION:
                // Selection mode - just update coordinates
                setIsDragging(true);
                setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
                break;
                
            case TOOLS.PENCIL:
                // Drawing mode
                setIsDrawing(true);
                setCurrentPath([{ x, y }]);
                break;
                
            case TOOLS.AI_BUILDING:
                // AI Building detection - add a building label
                const newLabel = {
                    id: Date.now(),
                    x,
                    y,
                    text: 'Building',
                    type: 'building'
                };
                setLabels(prev => [...prev, newLabel]);
                saveToHistory();
                break;
                
            case TOOLS.DELETE:
                // Delete mode - remove drawings/labels near click
                handleDelete(x, y);
                break;
                
            default:
                // Default pan mode
                setIsDragging(true);
                setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const currentCoords = {
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top)
        };
        setCoordinates(currentCoords);

        if (isDrawing && activeToolIndex === TOOLS.PENCIL) {
            // Continue drawing
            const x = (e.clientX - rect.left) / zoom - pan.x / zoom;
            const y = (e.clientY - rect.top) / zoom - pan.y / zoom;
            setCurrentPath(prev => [...prev, { x, y }]);
        } else if (isDragging && activeToolIndex === TOOLS.SELECTION) {
            // Pan the map
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        if (isDrawing && currentPath.length > 1) {
            // Save the drawing
            const newDrawing = {
                id: Date.now(),
                path: [...currentPath],
                color: '#e74c3c',
                width: 3
            };
            setDrawings(prev => [...prev, newDrawing]);
            saveToHistory();
        }
        
        setIsDrawing(false);
        setIsDragging(false);
        setCurrentPath([]);
    };

    const handleDelete = (clickX, clickY) => {
        // Delete drawings near click point
        const tolerance = 20;
        
        setDrawings(prev => prev.filter(drawing => {
            const isNear = drawing.path.some(point => 
                Math.abs(point.x - clickX) < tolerance && 
                Math.abs(point.y - clickY) < tolerance
            );
            return !isNear;
        }));
        
        setLabels(prev => prev.filter(label => 
            Math.abs(label.x - clickX) > tolerance || 
            Math.abs(label.y - clickY) > tolerance
        ));
        
        saveToHistory();
    };

    const handleToolboxToggle = () => {
        setIsToolboxOpen(!isToolboxOpen);
    };

    const handleToolSelect = (index) => {
        setActiveToolIndex(index);
        
        // Handle specific tool actions
        switch (index) {
            case TOOLS.UNDO:
                handleUndo();
                break;
            case TOOLS.REDO:
                handleRedo();
                break;
            default:
                console.log(`Tool selected: ${hoverTools[index].name}`);
        }
    };

    const pathToSVG = (path) => {
        if (path.length < 2) return '';
        
        let d = `M ${path[0].x} ${path[0].y}`;
        for (let i = 1; i < path.length; i++) {
            d += ` L ${path[i].x} ${path[i].y}`;
        }
        return d;
    };

    const getCursor = () => {
        switch (activeToolIndex) {
            case TOOLS.PENCIL:
                return 'crosshair';
            case TOOLS.DELETE:
                return 'pointer';
            case TOOLS.AI_BUILDING:
                return 'copy';
            default:
                return isDragging ? 'grabbing' : 'grab';
        }
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [isDrawing, currentPath, isDragging]);

    // Initialize history
    useEffect(() => {
        if (history.length === 0) {
            setHistory([{ drawings: [], labels: [], selectedAreas: [] }]);
            setHistoryIndex(0);
        }
    }, []);

    return (
        <div className="map-container">
            {/* High Resolution Satellite Map Background */}
            <div
                className="map-image"
                ref={mapRef}
                style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    backgroundImage: `url(${mapImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    height: '100%',
                    cursor: getCursor()
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            >
                {/* SVG Overlay for drawings */}
                <svg
                    ref={svgRef}
                    className="drawing-overlay"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`
                    }}
                >
                    {/* Render saved drawings */}
                    {drawings.map(drawing => (
                        <path
                            key={drawing.id}
                            d={pathToSVG(drawing.path)}
                            stroke={drawing.color}
                            strokeWidth={drawing.width}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                    
                    {/* Render current drawing path */}
                    {currentPath.length > 1 && (
                        <path
                            d={pathToSVG(currentPath)}
                            stroke="#e74c3c"
                            strokeWidth={3}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                </svg>

                {/* Labels overlay */}
                <div className="labels-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`
                }}>
                    {labels.map(label => (
                        <div
                            key={label.id}
                            className="map-label"
                            style={{
                                position: 'absolute',
                                left: label.x,
                                top: label.y,
                                background: 'rgba(231, 76, 60, 0.9)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                pointerEvents: 'auto',
                                cursor: 'pointer'
                            }}
                        >
                            {label.text}
                        </div>
                    ))}
                </div>

                {/* Highlighted Areas sesuai gambar */}
                <div className="highlighted-area area-1"></div>
                <div className="highlighted-area area-2"></div>
            </div>

            {/* Zoom Controls */}
            <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

            {/* Main Toolbar - 3 tombol utama */}
            <div className="main-toolbar-bottom">
                {mainTools.map((tool, index) => (
                    <button 
                        key={index}
                        className="main-tool-btn"
                        onClick={() => onMainToolClick(tool.action)}
                    >
                        {tool.name}
                    </button>
                ))}
            </div>

            {/* Floating Toolbox dengan Hover Tools */}
            <div className="floating-toolbox">
                {/* Trigger Button untuk buka/tutup toolbox */}
                <button 
                    className="toolbox-trigger"
                    onClick={handleToolboxToggle}
                    title="Toggle Toolbox"
                >
                    <span className="toolbox-icon">🔧</span>
                </button>

                {/* Tools Panel - muncul saat diklik */}
                <div className={`tools-panel ${isToolboxOpen ? 'visible' : ''}`}>
                    {hoverTools.map((tool, index) => (
                        <div 
                            key={index}
                            className={`tool-item ${activeToolIndex === index ? 'active' : ''}`}
                            onClick={() => handleToolSelect(index)}
                            title={tool.tooltip}
                        >
                            <span className="tool-icon">{tool.icon}</span>
                            <div className="tool-tooltip">{tool.tooltip}</div>
                        </div>
                    ))}
                    
                    {/* Close Button di akhir list */}
                    <div 
                        className="tool-item close-btn"
                        onClick={() => setIsToolboxOpen(false)}
                        title="Close Toolbox"
                    >
                        <span className="tool-icon">✕</span>
                        <div className="tool-tooltip">Close</div>
                    </div>
                </div>
            </div>

            {/* Tool Status Display */}
            <div className="tool-status">
                <span>Active Tool: {getCurrentTool()?.name || 'None'}</span>
                {activeToolIndex === TOOLS.PENCIL && <span> - Click and drag to draw</span>}
                {activeToolIndex === TOOLS.AI_BUILDING && <span> - Click to add building label</span>}
                {activeToolIndex === TOOLS.DELETE && <span> - Click on drawings to delete</span>}
            </div>

            <LegendPanel visible={showLegend} />
            <LoadingOverlay visible={isLoading} />
        </div>
    );
};

export default MapContainer;