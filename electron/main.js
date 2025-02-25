const { app, BrowserWindow, ipcMain } = require("electron");
app.disableHardwareAcceleration();
const path = require("path");
const Database = require("better-sqlite3");

let mainWindow;
let db;

require("electron-reload")(
  path.join(__dirname, "dist/browser/word-cloud-app"),
  {}
);

function initializeDatabase(dbPath) {
  db = new Database(dbPath, { verbose: console.log });
  db.exec(`CREATE TABLE IF NOT EXISTS clouds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    words JSON NOT NULL
  )`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
     webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
    }, 
  });

  const isDev = process.env.NODE_ENV === "development";
  const startURL = isDev
    ? "http://localhost:4200"
    : `file://${path.join(
        __dirname,
        "dist/word-cloud-app/browser/index.html"
      )}`;

  mainWindow
    .loadURL(startURL)
    .then(() => {
      console.log("Window loaded successfully!");
    })
    .catch((err) => {
      console.error("Failed to load URL:", err);
    });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.on("ready", () => {
  createWindow();
  const dbPath = path.join(app.getPath("userData"), "wordcloud.db");
  initializeDatabase(dbPath);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (db) {
    db.close();
    console.log("Database connection closed.");
  }
});

ipcMain.handle("initialize-database", (event, dbPath) => {
  if (!db) {
    initializeDatabase(dbPath);
  }
});

// IPC handler to get database path
ipcMain.handle("get-db-path", (event) => {
  const dbPath = path.join(app.getPath("userData"), "wordcloud.db");
  return dbPath;
});

// IPC handler to load all clouds
ipcMain.handle("get-clouds", () => {
  const rows = db.prepare("SELECT * FROM clouds").all();
  return rows;
});

ipcMain.handle("add-cloud", (event, wordCloud) => {
  console.log("Received WordCloud:", wordCloud); 
  const { name, category, words } = wordCloud;
  const stmt = db.prepare(
    "INSERT INTO clouds (name, category, words) VALUES (?, ?, ?)"
  );
  const result = stmt.run(name, category, JSON.stringify(words));

  // const lastInsertedId = db.prepare('SELECT last_insert_rowid()').get();
  //console.log("Inserted Word Cloud ID: ", lastInsertedId);
  //return { insertId: result.lastInsertRowid };
  console.log("Inserted Word Cloud ID:", result.lastInsertRowid); // Log to ensure it has the ID
  return {
    id: result.lastInsertRowid,
    name,
    category,
    words,
  };
});

// IPC handler to update an existing cloud
ipcMain.handle("update-cloud", (event, wordCloud) => {
  const { id, name, category, words} = wordCloud
  console.log(wordCloud)
  const stmt = db.prepare(
    "UPDATE clouds SET name = ?, category= ?, words = ? WHERE id = ?"
  );
  stmt.run(name, category, JSON.stringify(words), id);
});

ipcMain.handle("delete-cloud", (event, id) => {
  const stmt = db.prepare("DELETE FROM clouds WHERE id = ?");
  stmt.run(id);
});

ipcMain.handle("get-word-cloud-by-id", (event, id) => {
  const stmt = db.prepare("SELECT * FROM clouds WHERE id = ?");
  const row = stmt.get(id);
  if (row) {
    if (typeof row.words === "string") {
      try {
        row.words = JSON.parse(row.words);
      } catch (e) {
        console.error("Error parsing words string:", e);
        row.words = [];
      }
    }
  }
  return row;
});

ipcMain.handle("set-wallpaper", async (event, base64Image) => {
  const os = require("os");
  const fs = require("fs");
  const path = require("path");
  const { exec } = require("child_process");
  const wallpaperDir = path.join(os.homedir(), ".config", "wordcloud_wallpapers");

  if (!fs.existsSync(wallpaperDir)) {
    fs.mkdirSync(wallpaperDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const wallpaperPath = path.join(wallpaperDir, `wordcloud-${timestamp}.png`);
  const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(wallpaperPath, base64Data, "base64");

   // Detect OS and desktop environment
   const platform = process.platform;

  let setWallpaperCommand = "";

  if (platform === "linux") {
    const desktopEnv = (process.env.XDG_MENU_PREFIX || "").toLowerCase();
    if (desktopEnv.includes("gnome")) {
      setWallpaperCommand = `gsettings set org.gnome.desktop.background picture-options "scaled" && gsettings set org.gnome.desktop.background picture-uri "file://${wallpaperPath}"`;
    } else if (desktopEnv.includes("kde")) {
      setWallpaperCommand = `qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript 'var a = desktops(); for (i in a) a[i].wallpaperPlugin = "org.kde.image"; a[i].currentConfigGroup = ["Wallpaper", "org.kde.image", "General"]; a[i].writeConfig("Image", "file://${wallpaperPath}")'`;
    } else if (desktopEnv.includes("xfce")) {
      setWallpaperCommand = `xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitor0/image-path -s ${wallpaperPath}`;
    } else {
      console.error("Unsupported Linux desktop environment");
      return;
    }
  } else if (platform === "win32") {
    setWallpaperCommand = `powershell -Command "(New-Object -ComObject WScript.Shell).RegWrite('HKCU\\Control Panel\\Desktop\\Wallpaper', '${wallpaperPath}', 'REG_SZ'); RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters"`;
  } else {
    console.error("Unsupported OS");
    return;
  }

  exec(setWallpaperCommand, (err) => {
    if (err) {
      console.error("Failed to set wallpaper:", err);
    } else {
      console.log("Wallpaper set successfully!");
    }
  });

  // Keep only the latest 5 wallpapers
  const files = fs.readdirSync(wallpaperDir)
    .map(file => ({
      name: file,
      time: fs.statSync(path.join(wallpaperDir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 5) {
    files.slice(5).forEach(file => {
      fs.unlinkSync(path.join(wallpaperDir, file.name));
    });
  }
});