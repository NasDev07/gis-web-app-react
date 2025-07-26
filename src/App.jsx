import React, { useState } from 'react';
import './App.css';
import MapContainer from './components/MapContainer';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import ProgressBar from './components/ProgressBar';

const App = () => {
  const [activeToolIndex, setActiveToolIndex] = useState(0);
  const [showLegend, setShowLegend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Main 3 tools sesuai spesifikasi gambar
  const mainTools = [
    { name: "Back to Home", action: "home" },
    { name: "Save Progress", action: "progress" },
    { name: "Export Labels", action: "export" }
  ];

  // 6 Interactive Hover tools dengan fungsi nyata
  const hoverTools = [
    { 
      icon: "🔍", 
      name: "Selection", 
      tooltip: "Selection tool - Pan and select areas" 
    },
    { 
      icon: "🏢", 
      name: "AI Building", 
      tooltip: "AI Building labeler - Click to detect buildings" 
    },
    { 
      icon: "✏️", 
      name: "Pencil", 
      tooltip: "Pencil tool - Draw on map" 
    },
    { 
      icon: "🗑️", 
      name: "Delete", 
      tooltip: "Delete tool - Remove drawings and labels" 
    },
    { 
      icon: "↩️", 
      name: "Undo", 
      tooltip: "Undo last action" 
    },
    { 
      icon: "↪️", 
      name: "Redo", 
      tooltip: "Redo last action" 
    }
  ];

  const handleMainToolClick = (action) => {
    switch (action) {
      case 'home':
        // Reset view to home position
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setShowLegend(false);
        setActiveToolIndex(0); // Reset to selection tool
        console.log('🏠 Back to Home activated - View reset');
        break;
      case 'progress':
        // Show progress simulation
        simulateProgress();
        console.log('💾 Save Progress activated - Saving...');
        break;
      case 'export':
        // Toggle export labels panel
        setShowLegend(!showLegend);
        console.log('📤 Export Labels activated - Panel toggled');
        break;
      default:
        console.log(`Action ${action} activated`);
    }
  };

  const simulateProgress = () => {
    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
            console.log('✅ Progress saved successfully!');
          }, 1000);
          return 100;
        }
        return prev + 12;
      });
    }, 150);
  };

  return (
    <div className="app-container">
      <ProgressBar progress={progress} />

      <Toolbar />

      <div className="main-content">
        <MapContainer
          zoom={zoom}
          pan={pan}
          setZoom={setZoom}
          setPan={setPan}
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          showLegend={showLegend}
          isLoading={isLoading}
          mainTools={mainTools}
          hoverTools={hoverTools}
          onMainToolClick={handleMainToolClick}
          activeToolIndex={activeToolIndex}
          setActiveToolIndex={setActiveToolIndex}
        />
      </div>

      <StatusBar coordinates={coordinates} zoom={zoom} />
    </div>
  );
};

export default App;