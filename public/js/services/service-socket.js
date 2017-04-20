app.factory('socket',function(socketFactory){
	//Create socket and connect to http://chat.socket.io 
 	//var myIoSocket = io.connect('http://localhost:3200');
	var myIoSocket = io.connect('http://jyap-server.herokuapp.com/');

  	mySocket = socketFactory({
    	ioSocket: myIoSocket
  	});
  	
	return mySocket;
})