const {ipcRenderer} = require('electron');

class Renderer {
	constructor() {
		this.mainContent = document.getElementById('main-content');
		this.addListeners();
	}
	addListeners() {
		ipcRenderer.on('info' , (event , data) => {
			this.mainContent.innerText = `${data.count} / ${data.total}`;
		});
	}
}

new Renderer();