import { fabric } from 'fabric'
import deep from 'deep-diff'
import ws from './MainSocket'

class Board {
	constructor() {
		fabric.Object.prototype.transparentCorners = false
	}

	init(session, local_canvas, remote_canvas) {
		this.session = session
		this.canvas = local_canvas
		this.remote_canvas = remote_canvas
		this.setBrush('pencil')
		this.setColor('#000')
		this.setWidth(10)
		this.clear()
		this.last_canvas = {}
		this.last_remote_canvas = {}
		this.canvas.on('canvas:render', e => {
			// calculate the diff and send to the other
			const difference = deep.diff(this.last_canvas, this.canvas.toJSON())
			if (difference) {
				this.session.send('canvas:render', {diff: difference})
				difference.forEach(function (change) {
					deep.diff.applyChange(this.last_canvas, true, change)
				})
			}
		})
		ws.on('canvas:render', msg => {
			msg.data.diff.forEach(change => {
				deep.diff.applyChange(this.last_remote_canvas, true, change)
			})
			this.remote_canvas.loadFromJSON(JSON.stringify(this.last_remote_canvas))
		})
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
		this.color = color
		this.canvas.freeDrawingBrush.color = this.color
	}

	setWidth(width) {
		this.width = width
		this.canvas.freeDrawingBrush.width = this.width || 1
	}
}

export default Board