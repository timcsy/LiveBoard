const deep = DeepDiff.noConflict()

const canvas = new fabric.Canvas('canvas_local', {
	isDrawingMode: true
})
const canvas_remote = new fabric.Canvas('canvas_remote', {
	isDrawingMode: false
})

fabric.Object.prototype.transparentCorners = false

const drawingModeEl = document.getElementById('drawing-mode'),
			drawingOptionsEl = document.getElementById('drawing-mode-options'),
			drawingOptionsSelector = document.getElementById('drawing-mode-selector'),
      drawingColorEl = document.getElementById('drawing-color'),
      drawingLineWidthEl = document.getElementById('drawing-line-width'),
			clearEl = document.getElementById('clear-canvas')

clearEl.onclick = function () { canvas.clear() }

drawingModeEl.onclick = function () {
	canvas.isDrawingMode = !canvas.isDrawingMode;
	if (canvas.isDrawingMode) {
		drawingModeEl.innerHTML = '修改'
		drawingOptionsEl.style.display = ''
	}
	else {
		drawingModeEl.innerHTML = '繪圖'
		drawingOptionsEl.style.display = 'none'
	}
}

drawingOptionsSelector.onchange = function () {
	canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas)
	if (this.value === 'pencil') {
		canvas.freeDrawingBrush.color = drawingColorEl.value
	}
	else if (this.value === 'eraser') {
		canvas.freeDrawingBrush.color = 'white'
	}
	
	canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1
}

drawingColorEl.onchange = function () {
	canvas.freeDrawingBrush.color = this.value
}
drawingLineWidthEl.onchange = function () {
	canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1
	this.previousSibling.innerHTML = this.value
}

if (canvas.freeDrawingBrush) {
	canvas.freeDrawingBrush.color = drawingColorEl.value
	canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1
}

let last_canvas = {}
canvas.on('after:render', (e) => {
	// calculate the diff and send to the other
	const difference = deep.diff(last_canvas, canvas.toJSON())
	if (difference) {
		const receiver = document.getElementById("receiver").value
		ws.send(JSON.stringify({to: receiver, cmd: 'after:render', diff: difference}))
		difference.forEach(function (change) {
			deep.diff.applyChange(last_canvas, true, change)
		})
	}
})

let last_remote_canvas = {}
function afterRender(msg) {
	// apply the change from diff
	msg.diff.forEach(function (change) {
		deep.diff.applyChange(last_remote_canvas, true, change)
	})
	canvas_remote.loadFromJSON(JSON.stringify(last_remote_canvas))
}