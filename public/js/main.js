$('document').ready(function(){
	var messages = [];
	var socket = io.connect("http://localhost:9001");
	var nick;
	var server;
	var channel;

	socket.on('nicklist', function(data){
		console.log(data.nicklist);
		var html = '';
		for (var key in data.nicklist){
			html += key+"<br>";	
		}
		$('#users').html(html);
	});
	
	socket.on("message", function(data){
		if (data.msg){
			messages.push("<span class=\"user\">"+data.from +" -> "+data.to+" : </span>"+data.msg);
			var html = '';
			for (var i = 0; i < messages.length; i++){
				html+=messages[i] + "<br>";
			}
			$('#chatbot').html(html);
			var chatbox = document.getElementById('chatbot');
			chatbox.scrollTop = chatbox.scrollHeight;
		} else {
			console.log("there is a problem "+data);
		}
	});

	$('#send').click(function(){
		var text = $('#textbox').val();
		var html = '';
		messages.push("<span class=\"me\" >"+nick+" -> "+channel+" :</span> "+text);
		for (var i = 0; i < messages.length; i++){
			html+=messages[i]+"<br>";
		}
		$('#chatbot').html(html);
		$('#textbox').val('');
		socket.emit("send", {message: text});
		var chatbox = document.getElementById('chatbot');
		chatbox.scrollTop = chatbox.scrollHeight;
	});

	$('#textbox').keydown(function (e){
    		if(e.keyCode == 13){
			var text = $('#textbox').val();
                	var html = '';
                	messages.push("<span class=\"me\" >"+nick+" -> "+channel+" :</span> "+text);
                	for (var i = 0; i < messages.length; i++){
                       		html+=messages[i]+"<br>";
                	}
                	$('#chatbot').html(html);
                	$('#textbox').val('');
                	socket.emit("send", {message: text});
                	var chatbox = document.getElementById('chatbot');
                	chatbox.scrollTop = chatbox.scrollHeight;
    			}
	});

	$('#connectbtn').click(function(){
		nick = $('#nick').val();
	        server = $('#server').val();
		channel = $('#channel').val();
		
		socket.emit('ircconnect',{server: server, nick: nick, channel: channel});
	        $(this).prop('disabled',true);
		$('#nick').prop('disabled',true);
		$('#server').prop('disabled',true);
		$('#channel').prop('disabled',true);
		$('#send').prop('disabled',false);
		$('#textbox').prop('disabled',false);	
		$('#connecting').html('connecting');
		$('#textbox').prop('placeholder','message...');
		$('#disconnect').prop('disabled',false);
		console.log("nice");
	});

	$('#disconnect').click(function(){
		socket.emit('userdisconnect',{});
		$(this).prop('disabled',true);
                $('#nick').prop('disabled',false);
                $('#server').prop('disabled',false);
                $('#channel').prop('disabled',false);
                $('#send').prop('disabled',true);
                $('#textbox').prop('disabled',true);
                $('#connecting').html('disconnected');
                $('#textbox').prop('placeholder','not connected');
		$('#connectbtn').prop('disabled',false);
                console.log("neice");
	});
});
