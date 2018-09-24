
// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const five = require("johnny-five");
const shootingsData = require('./data');
let board;
let lcd;

const writeName = (incrementer) => {
	let name = shootingsData[incrementer];
	let nameArray = name.split(' ');
	let firstName = nameArray.shift();
	let lastName = nameArray.join(' ');
	lcd.clear();
	lcd.cursor(0, 0);
	lcd.print(firstName);
	lcd.cursor(1, 0);
	lcd.print(lastName);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 800, height: 600});

	// and load the index.html of the app.
	mainWindow.loadFile('index.html');

	mainWindow.setFullScreen(true);

	// get timezone offset milliseconds from midnight
	// https://stackoverflow.com/a/10944701
	var d = new Date();
	// offset from midnight in Greenwich timezone
	var msFromMidnightInGMT=d%86400000;
	// offset from midnight in locale timezone
	var msFromMidnightLocale=(d.getTime()-d.getTimezoneOffset()*60000)%86400000;

	let incrementer = 0;
	let msInDay = 86400000;
	let averageLength = msInDay/shootingsData.length;

	// if average length is 200
	// and there has been 2600 since midnight
	// then incrementer should start at 13
	// so, 2600/200
	
	incrementer = Math.floor(msFromMidnightLocale/averageLength);

	board = new five.Board();

	board.on("ready", function() {

		console.log(msInDay/shootingsData.length);

		lcd = new five.LCD({
			// LCD pin name  RS  EN  DB4 DB5 DB6 DB7
			// Arduino pin # 7    8   9   10  11  12
			pins: [7, 8, 9, 10, 11, 12],
			backlight: 6,
			rows: 2,
			cols: 20
		});

		writeName(incrementer);
		updateRenderer(incrementer + 1);
		incrementer = (incrementer + 1) % shootingsData.length;

		setInterval(() => {
			writeName(incrementer);
			updateRenderer(incrementer + 1);
			incrementer = (incrementer + 1) % shootingsData.length;
		}, averageLength);

		this.repl.inject({
			lcd: lcd
		});
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		lcd.clear();
		mainWindow = null;
	});
}

const updateRenderer = (incrementer) => {
	mainWindow.webContents.send('info' , {
		count: incrementer,
		total: shootingsData.length
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});