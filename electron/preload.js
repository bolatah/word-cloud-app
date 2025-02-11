// preload.js
const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld("electron", {
    getDbPath: () => ipcRenderer.invoke("get-db-path"),
    initializeDatabase: (dbPath) => ipcRenderer.invoke("initialize-database", dbPath),
    getClouds: () => ipcRenderer.invoke("get-clouds"),
    addCloud: (wordCloud) => ipcRenderer.invoke("add-cloud", wordCloud),
    updateCloud: (wordCloud) => ipcRenderer.invoke("update-cloud", wordCloud),
    deleteCloud: (id) => ipcRenderer.invoke("delete-cloud", id),
    getCloud : (id) => ipcRenderer.invoke("get-word-cloud-by-id", id),
    setWallpaper: (base64Image) => ipcRenderer.invoke("set-wallpaper", base64Image),

  });
