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
			socket.broadcast.to(account.username).emit("add-task",task);
			services.storage.addTask({
				username: account.username,
				task,
			});
		});
		socket.on("remove-task",taskId=>{
			socket.broadcast.to(account.username).emit("remove-task",taskId);
			services.storage.removeTask({
				username: account.username,
				taskId,
			});
		});
		socket.on("edit-task",task=>{
			socket.broadcast.to(account.username).emit("edit-task",task);
			services.storage.editTask({
				username: account.username,
				task,
			});
		});
		socket.on("toggle-taskItem",({id,key})=>{
			socket.broadcast.to(account.username).emit("toggle-taskItem",{id,key});
			services.storage.toggleTaskItem({
				username: account.username,
				id, key,
			});
		});
		socket.join(account.username);
	});
};
this.stop=()=>{
	this.io.close();
};
