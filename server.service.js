// Rio...#5519
const socket_io=require("socket.io");
const services={
	account: service_require("server/account/account.new"),
};
this.start=()=>{
	this.io=socket_io(42856,{
		cors:{
			origin:"*",
		},
	});
	this.io.on("connect",socket=>{
		const token=socket.handshake.auth.token;
		const login=services.account.authUserByInput({token});
		if(!login.allowed||!token){
			socket.emit("error_code","wrong-token");
			socket.disconnect();
			return;
		}
		const {account,accountIndex}=login.data;
	});
};
this.stop=()=>{
	this.io.close();
};
