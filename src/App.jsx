import React, { useState, useEffect } from 'react';
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
  const [projectData, setProjectData] = useState(null);
  const [isElectron, setIsElectron] = useState(false);

  // Check if running in Electron
  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && window.electronAPI);
  }, []);

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

  // Handle Electron menu actions
  useEffect(() => {
    if (isElectron && window.electronAPI) {
      const handleMenuAction = (event, action, data) => {
        console.log('Menu action received:', action, data);

        switch (action) {
          case 'new-project':
            handleNewProject();
            break;
          case 'open-project':
            handleOpenProject(data);
            break;
          case 'save-project':
            handleSaveProject();
            break;
          case 'export-labels':
            handleMainToolClick('export');
            break;
          case 'undo':
            setActiveToolIndex(4); // Undo tool
            break;
          case 'redo':
            setActiveToolIndex(5); // Redo tool
            break;
          case 'zoom-in':
            setZoom(prev => Math.min(prev * 1.2, 3));
            break;
          case 'zoom-out':
            setZoom(prev => Math.max(prev / 1.2, 0.5));
            break;
          case 'reset-zoom':
            setZoom(1);
            break;
          case 'toggle-legend':
            setShowLegend(prev => !prev);
            break;
          case 'tool-selection':
            setActiveToolIndex(0);
            break;
          case 'tool-ai-building':
            setActiveToolIndex(1);
            break;
          case 'tool-pencil':
            setActiveToolIndex(2);
            break;
          case 'tool-delete':
            setActiveToolIndex(3);
            break;
          case 'clear-all':
            handleClearAll();
            break;
          default:
            console.log('Unknown menu action:', action);
        }
      };

      window.electronAPI.onMenuAction(handleMenuAction);

      return () => {
        window.electronAPI.removeMenuActionListener(handleMenuAction);
      };
    }
  }, [isElectron]);

  const handleNewProject = () => {
    setProjectData(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setShowLegend(false);
    setActiveToolIndex(0);
    console.log('🆕 New project created');
  };

  const handleOpenProject = async (filePath) => {
    if (filePath) {
      try {
        // In a real app, you would read the file content here
        console.log('📂 Opening project from:', filePath);
        simulateProgress();
      } catch (error) {
        console.error('Error opening project:', error);
      }
    } else if (isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.openFileDialog();
        if (!result.canceled && result.filePaths.length > 0) {
          console.log('📂 Opening project from:', result.filePaths[0]);
          simulateProgress();
        }
      } catch (error) {
        console.error('Error opening file dialog:', error);
      }
    }
  };

  const handleSaveProject = async () => {
    if (isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.saveFileDialog();
        if (!result.canceled) {
          console.log('💾 Saving project to:', result.filePath);
          simulateProgress();

          // Here you would save the actual project data
          const projectData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            zoom,
            pan,
            activeToolIndex,
            showLegend,
            coordinates
          };

          console.log('Project data to save:', projectData);
        }
      } catch (error) {
        console.error('Error saving project:', error);
      }
    } else {
      // Fallback for web version
      simulateProgress();
      console.log('💾 Save Progress activated - Saving...');
    }
  };

  const handleClearAll = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveToolIndex(0);
    setShowLegend(false);
    console.log('🗑️ All data cleared');
  };

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
        // Save progress
        handleSaveProject();
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
            console.log('✅ Operation completed successfully!');
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

      <Toolbar isElectron={isElectron} />

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
          isElectron={isElectron}
        />
      </div>

      <StatusBar
        coordinates={coordinates}
        zoom={zoom}
        isElectron={isElectron}
        platform={isElectron ? window.electronAPI?.platform : 'web'}
      />
    </div>
  );
};

export default App;