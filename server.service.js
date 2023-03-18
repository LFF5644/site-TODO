const socket_io=require("socket.io");
const services={
	account: service_require("server/account/account.new"),
	storage: service_require("p/TODO/storage"),
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
		socket.emit("TODOs",services.storage.getTasks(account.username));
		socket.on("add-task",task=>{
			// TODO: send an all other clients with the same username
			services.storage.addTask({
				username: account.username,
				task,
			});
		});
		socket.on("remove-task",taskId=>{
			// TODO: send an all other clients with the same username
			services.storage.removeTask({
				username: account.username,
				taskId,
			});
		});
		socket.on("edit-task",task=>{
			// TODO: send an all other clients with the same username
			services.storage.editTask({
				username: account.username,
				task,
			});
		});
	});
};
this.stop=()=>{
	this.io.close();
};
