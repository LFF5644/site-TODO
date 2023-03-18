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
	this.save();
};
