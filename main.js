const { app, BrowserWindow } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

let djangoProcess = null;
let mainWindow = null;

function isPythonInstalled() {
    try {
        require('child_process').execSync('python --version', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

function installPythonAndContinue() {
    console.log('Python not found. Installing...');
    
    mainWindow.loadURL(`data:text/html,
        <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f5f5f5;">
                <div style="text-align:center;">
                    <h2>Emilia Report Card Maker</h2>
                    <p style="color:#0066cc;">⚙️ Installing Python... Please wait 2-3 minutes</p>
                    <p style="font-size:12px;color:#888;">This is a one-time setup</p>
                    <progress style="width:300px;"></progress>
                </div>
            </body>
        </html>
    `);
    
    const installerPath = path.join(__dirname, 'python-installer.exe');
    const pythonUrl = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9.exe';
    
    const https = require('https');
    const file = fs.createWriteStream(installerPath);
    
    https.get(pythonUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            const install = spawn(installerPath, ['/quiet', 'InstallAllUsers=1', 'PrependPath=1'], { shell: true, detached: true });
            install.on('close', (code) => {
                fs.unlinkSync(installerPath);
                setTimeout(() => { startDjango(); }, 3000);
            });
        });
    }).on('error', (err) => {
        console.error('Download failed:', err);
    });
}

function startDjango() {
    console.log('Starting Django...');
    const isWindows = process.platform === 'win32';
    const djangoPath = path.join(__dirname, 'django_app', 'manage.py');
    const djangoDir = path.join(__dirname, 'django_app');
    const pythonCmd = isWindows ? 'python' : '/Users/mac/Desktop/Emilia_Exam_Report_Card_App_Working/venv/bin/python3';
    
    djangoProcess = spawn(pythonCmd, [djangoPath, 'runserver', '--noreload', '127.0.0.1:8000'], {
        cwd: djangoDir,
        env: { ...process.env, DJANGO_SETTINGS_MODULE: 'emilia_report.settings' },
        shell: true
    });
    
    djangoProcess.stdout.on('data', (data) => {
        console.log(`Django: ${data}`);
        if (data.includes('Starting development server')) {
            setTimeout(() => { mainWindow.loadURL('http://127.0.0.1:8000'); }, 1000);
        }
    });
    
    djangoProcess.stderr.on('data', (data) => { console.log(`Django stderr: ${data}`); });
    djangoProcess.on('error', (err) => {
        if (process.platform === 'win32' && !isPythonInstalled()) { installPythonAndContinue(); }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({ width: 1280, height: 800, webPreferences: { nodeIntegration: false, contextIsolation: true }, title: "Emilia Report Card Maker", show: true, backgroundColor: '#f5f5f5' });
    mainWindow.loadURL(`data:text/html,<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f5f5f5;"><div style="text-align:center;"><h2>Emilia Report Card Maker</h2><p>Loading... Please wait</p><p style="font-size:12px;color:#888;">Starting server...</p></div></body></html>`);
}

app.whenReady().then(() => {
    if (process.platform === 'win32' && !isPythonInstalled()) { installPythonAndContinue(); } 
    else { startDjango(); }
    createWindow();
});

app.on('window-all-closed', () => {
    if (djangoProcess) {
        if (process.platform === 'win32') { spawn('taskkill', ['/pid', djangoProcess.pid, '/f', '/t'], { shell: true }); } 
        else { djangoProcess.kill(); }
    }
    app.quit();
});
