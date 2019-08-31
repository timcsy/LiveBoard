import { fabric } from 'fabric'
import deep from 'deep-diff'
import ws from './MainSocket'

class Board {
	constructor() {
		fabric.Object.prototype.transparentCorners = false
	}

	init(session, size) {
		this.session = session
		this.canvas = new fabric.Canvas('local_canvas', {
			isDrawingMode: true
		})
		this.remote_canvas = new fabric.Canvas('remote_canvas', {
			isDrawingMode: false
		})
		this.setSize(size)
		this.setBrush('pencil')
		this.setColor('black')
		this.setWidth(10)
		this.clear()
		this.last_canvas = {}
		this.last_remote_canvas = {}
		this.canvas.on('after:render', e => {
			// calculate the diff and send to the other
			const difference = deep.diff(this.last_canvas, this.canvas.toJSON())
			if (difference) {
				this.session.send('canvas:render', {diff: difference})
				difference.forEach(change => {
					deep.applyChange(this.last_canvas, true, change)
				})
			}
		})
		ws.on('canvas:render', msg => {
			msg.data.diff.forEach(change => {
				deep.applyChange(this.last_remote_canvas, true, change)
			})
			this.remote_canvas.loadFromJSON(JSON.stringify(this.last_remote_canvas))
		})
	}

	setSize(size) {
		this.canvas.setDimensions({ width: size, height: size })
		this.canvas.setZoom(size / 1440)
		this.remote_canvas.setDimensions({ width: size, height: size })
		this.remote_canvas.setZoom(size / 1440)
	}

	clear() {
		this.canvas.clear()
	}

	switchMode() {
		this.canvas.isDrawingMode = !this.canvas.isDrawingMode
		// if (canvas.isDrawingMode) {
		// 	drawingModeEl.innerHTML = '修改'
		// 	drawingOptionsEl.style.display = ''
		// }
		// else {
		// 	drawingModeEl.innerHTML = '繪圖'
		// 	drawingOptionsEl.style.display = 'none'
		// }
	}

	setBrush(brush) {
		this.brush = brush
		this.canvas.freeDrawingBrush = new fabric['PencilBrush'](this.canvas)
		if (brush == 'pencil') {
			this.canvas.freeDrawingBrush.color = this.color
		}
		else if (brush == 'eraser') {
			this.canvas.freeDrawingBrush.color = 'white'
		}
		
		this.canvas.freeDrawingBrush.width = this.width || 1
	}

	setColor(color) {
		if (this.brush == 'pencil') {
			this.color = color
			this.canvas.freeDrawingBrush.color = this.color
		}
	}

	setWidth(width) {
		this.width = width
		this.canvas.freeDrawingBrush.width = this.width || 1
	}
}

export default Board