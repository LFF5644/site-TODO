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
};
this.stop=()=>{

};