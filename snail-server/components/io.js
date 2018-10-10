export default () => {}

import io from 'socket.io-client'
//
function SocketEvents (socket, onConnect, onDisconnect, onMessage) {
	socket.on('connect', onConnect)
	socket.on('disconnect', onDisconnect)
	socket.on('event', onMessage)
//
	return function () {
		socket.off('connect', onConnect)
		socket.off('disconnect', onDisconnect)
		socket.off('event', onMessage)
		socket.destroy()
		socket = null
	}
}

class Something extends React.Component {
	constructor (props, context) {
		super(props, context)
	}
//
	componentDidMount () {
		const hostname = window.location.hostname
		const address = `http://${hostname}:${3001 || window.location.port}`
//
		this.io = io(address)
		this.closeSocket = SocketEvents(
			this.io,
			()=> {
				console.log('Socket connected')
			}, ()=> {
				console.log('Socket disconnected')
			}, (data)=> {
				console.log('Socket received data', data)
			})
	}
//
	componentWillUnmount () {
		if (this.closeSocket) {
			console.log('UNMOUNTING SOCKET')
			this.closeSocket()
		}
	}
//
	render () {
		return <div>Something</div>
	}
}
//
export default Something
