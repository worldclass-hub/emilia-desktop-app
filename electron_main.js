const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const http = require('http');

let djangoProcess = null;
let mainWindow = null;

function waitForServer(callback, retries = 10) {
    const check = () => {
        http.get('http://127.0.0.1:8000', (res) => {
            console.log('Server is ready!');
            callback();
        }).on('error', () => {
            if (retries > 0) {
                console.log('Waiting for server...', retries);
                setTimeout(() => {
                    waitForServer(callback, retries - 1);
                }, 1000);
            } else {
                console.log('Server did not start in time');
            }
        });
    };
    check();
}

function startDjango() {
    console.log('Starting Django...');
    djangoProcess = spawn('/Users/mac/Desktop/Emilia_Exam_Report_Card_App_Working/venv/bin/python3', 
        ['/Users/mac/Desktop/EmiliaReportCard_Electron/django_app/manage.py', 'runserver', '--noreload', '127.0.0.1:8000'],
        { cwd: '/Users/mac/Desktop/EmiliaReportCard_Electron/django_app', shell: true }
    );
    
    djangoProcess.stdout.on('data', (data) => {
        console.log(`Django: ${data}`);
    });
    
    djangoProcess.stderr.on('data', (data) => {
        console.log(`Django stderr: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        show: true
    });
    
    // Wait for server then load
    waitForServer(() => {
        mainWindow.loadURL('http://127.0.0.1:8000');
    });
}

app.whenReady().then(() => {
    startDjango();
    createWindow();
});

app.on('window-all-closed', () => {
    if (djangoProcess) djangoProcess.kill();
    app.quit();
});
