//Globals and Includes
var PORT = 9001
    express = require('express')
    app = express()
	irc = require('irc');

//Express config
app.set('views',__dirname+"/views");
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname+"/public"));

//Accept only one route
app.get('/', function(req,res){
	res.render("home");
});

//Include Socket.io, listen over express
var io = require('socket.io').listen(app.listen(PORT));

//Socket.io magic
io.sockets.on('connection', function(socket){
	//Instance Variables for socket connection
	var client;
	var channel;
	var server;
	var nick;
	
	//when client requests to join
	socket.on('ircconnect', function(data){
        server = data.server;
		channel = data.channel;
		nick = data.nick;

		//Log server info for debugging
		console.log("attempting to join : "+data.server+" "+data.channel+" as "+data.nick);

		//Join irc server + specific channel
		client = new irc.Client(server, nick, {channels: [channel]});

		//Listener for when successfully joined
		client.on('join',function(channel, nick){
			//Send join notification
			socket.emit('message', {message: nick+' joined '+server+' -> '+channel});
		});

		//Listener for other irc clients in channel
		client.on('names',function(channel, nicks){
			//send list of other clients in channel to client
			socket.emit('nicklist',{nicklist: nicks});
		});

		//Add listener for messages in irc
		client.addListener('message', function(from, to, msg){
			//on message, send to client
			socket.emit('message', {from: from, to: to, msg: msg});
		});

		//Listener for when client wants to send message
		socket.on('send',function(data){
			//send message through irc
			client.say(channel,data.message);
		});

		//Listener for when client disconnects from socket
		socket.on('disconnect',function(){
			//leave irc server
			client.disconnect();
		});

		//Listener for manual disconnect
		socket.on('userdisconnect',function(){
			client.disconnect();
		});
	});
});

//Log the port that the app is listening on
console.log("App listening on port -> "+PORT);
