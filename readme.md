A fiveM dashboard built with next.js and react, leveraging webrtc.

WIP

## Setup

* Build the web client
		cd /snail-server
		npm i && npm run build
* Create __.env__ in __./server__

	```
	PORT=3000
	NODE_ENV=production
	MONGO_URL=mongodb://<username>:<password>@<address>/<db>
	SESSION_SECRET=keyboard snail
	```
	You can get a free MongoDB database at [https://mlab.com/](https://mlab.com/)

* Add resources to your fiveM server config
	```
	start simple-peer
	start snail-server
	start snail-client
	```

* Have a look at /snail-client/client.lua on how to Register

## Contribute
Pull requests and issues are welcome


#### LICENSE MIT
