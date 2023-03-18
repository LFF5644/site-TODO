const services={
	account: service_require("server/account/account.new"),
};
const {ReadJsonFile,WriteFile}=globals.functions;

const tasksFile="tasks.json";
const accountJsonFile="account.json";
const accountFolder="data/accounts";

this.start=()=>{
	this.accounts=[];

	loadFromAccountService:{
		const accountIndex=services.account.accountIndex;
		const accountDirs=accountIndex.map(item=>accountFolder+"/"+item);

		for(const accountDir of accountDirs){
			const tasks=ReadJsonFile(accountDir+"/"+tasksFile);
			const account=ReadJsonFile(accountDir+"/"+accountJsonFile)
			if(tasks){
				this.accounts.push({
					username: account.username,
					nickname: account.nickname,
					accountDir,
					tasks,
				});
			}
		}

	};
	setInterval(this.save,5e3);
};
this.getTasks=username=>{
	const account=this.accounts.find(item=>item.username===username);
	if(!account){
		return[];
	}
	return account.tasks;
};
this.addTask=data=>{
	const {username,task}=data;
	const index=this.accounts.findIndex(item=>item.username===username);
	if(index===-1){
		for(let folder of services.account.accountIndex){
			folder=accountFolder+"/"+folder;
			const account=ReadJsonFile(folder+"/"+accountJsonFile);
			if(account.username===username){
				this.accounts.push({
					username: account.username,
					nickname: account.nickname,
					accountDir: folder,
					tasks: [task],
					saveRequired: true,
				});
				break;
			}
		}
		return;
	}
	this.accounts[index].tasks.push(task);	
	this.accounts[index].saveRequired=true;	
};
this.removeTask=data=>{
	const {username,taskId}=data;
	const index=this.accounts.findIndex(item=>item.username===username);
	if(index===-1) throw new Error("Username not found! => this.removeTask");
	const account=this.accounts[index];
	this.accounts[index].tasks=account.tasks.filter(item=>item.id!==taskId);
	this.accounts[index].saveRequired=true;
};
this.editTask=data=>{
	const {username,task}=data;
	const index=this.accounts.findIndex(item=>item.username===username);
	if(index===-1) throw new Error("Username not found! => this.editTask");
	const account=this.accounts[index];
	this.accounts[index].tasks=account.tasks
		.map(item=>item.id===task.id?
			{
				...item,
				...task,
			}:item
		);
	this.accounts[index].saveRequired=true;
};
this.toggleTaskItem=data=>{
	const {username,id,key}=data;
	const index=this.accounts.findIndex(item=>item.username===username);
	if(index===-1) throw new Error("Username not found! => this.toggleTaskItem");
	const account=this.accounts[index];
	this.accounts[index].tasks=account.tasks
		.map(item=>item.id===id?
			{
				...item,
				[key]: !item[key],
			}:item
		);
	this.accounts[index].saveRequired=true;
}
this.save=saveRequired=>{
	saveRequired=saveRequired===true;

	if(
		!saveRequired&&
		this.accounts.some(item=>item.saveRequired)
	){
		return false;
	}

	for(const account of this.accounts){
		const dir=account.accountDir;
		const tasks=account.tasks;
		if(!account.saveRequired&&!saveRequired) continue;
		const index=this.accounts.findIndex(item=>item.username===account.username);
		this.accounts[index].saveRequired=false;
		WriteFile(
			dir+"/"+tasksFile,
			JSON.stringify(tasks,null,2)
				.split("  ")
				.join("\t")
		);
	}
	return true;
};
this.stop=()=>{
	this.save(true);
};
