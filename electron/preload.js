import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    saveFileDialog: () => ipcRenderer.invoke('save-file-dialog'),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

    // Menu actions
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-action', callback);
    },

    removeMenuActionListener: (callback) => {
        ipcRenderer.removeListener('menu-action', callback);
    },

    // Platform info
    platform: process.platform,

    // Version info
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});

// Security: Remove the node integration and enable context isolation