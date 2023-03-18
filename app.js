/**
	@type {typeof import('lui/index')}
*/
const lui=window.lui;
const {
	init,
	node,
	node_dom,
	node_map,
	hook_memo,
	hook_model,
	hook_effect,
}=lui;

const model={
	init:()=>({
		tasks: [],
		taskText: "",
		taskTitle: "",
		view: "tasks",
	}),
	setTasks:(state,tasks)=>({
		...state,
		tasks: tasks.map(item=>({
			id: Date.now(),
			title: null,
			text: null,
			finished: false,
			...item,
		})),
	}),
	addTask:(state,task)=>{
		socket.emit("add-task",task);
		console.log("add task",task);
		return{
			...state,
			tasks:[
				...state.tasks,
				{
					id: Date.now(),
					title: null,
					text: null,
					finished: false,
					...task,
				},
			],
		};
	},
	removeTask:(state,id)=>{
		socket.emit("remove-task",id);
		console.log("remove task",id);
		return{
			...state,
			tasks: state.tasks.filter(item=>item.id!==id)
		};
	},
	editTask:(state,task)=>{
		socket.emit("edit-task",task);
		console.log("edit task",task);
		return{
			...state,
			tasks: state.tasks.map(
				item=>item.id===task.id?{
					...item,
					...task,
					id: item.id,
				}:item
			),
		};
	},
	toggleTaskItem:(state,id,key)=>{
		socket.emit("toggle-taskItem",{id,key});
		console.log("toggle Task Item",{id,key});
		return{
			...state,
			tasks: state.tasks.map(
				item=>item.id===id?{
					...item,
					[key]: !item[key],
				}:item
			),
		};
	},
	setTaskTitle:(state,taskTitle)=>({
		...state,
		taskTitle,
	}),
	setTaskText:(state,taskText)=>({
		...state,
		taskText,
	}),
	setView:(state,view)=>({
		...state,
		view,
	}),
};

function getToken(){
	const cookie=document.cookie.split("; ").find(item=>item.startsWith("token="));
	if(cookie) return cookie.substring(6);
	return null;
}
function ViewTasks({socket,state,actions}){return[
	state.tasks.length===0&&
	node_dom("h1[innerText=Keine TODOs]"),
	node_dom("p[innerText=Aufgabe jz ]",null,[
		node_dom("a[innerText=erstellen]",{
			onclick:()=> actions.setView("addTask"),
		}),
	]),

	state.tasks.length>0&&
	node_dom("table",{
		F:{
			tasks: true,
		},
	},[
		node_map(Task,state.tasks,{socket,state,actions}),
	]),	
]}
function Task({I,socket,state,actions}){return[
	node_dom("tr[style=user-select: none;]",null,[
		node_dom("td",null,[
			node_dom("input[type=checkbox]",{
				oninput: event=> actions.editTask({
					id: I.id,
					finished: event.target.checked,
				}),
				checked: I.finished,
			})
		]),
		node_dom("td",{
			innerText: I.title,
			title: I.text,
			onclick:()=> actions.toggleTaskItem(I.id,"finished"),
			F:{
				finished: I.finished,
			},
		}),
		node_dom("td",null,[
			node_dom("button[innerText=E]",{
				onclick:()=> actions.setView(I.id),
			}),
		]),
	]),
]}
function ViewAddTask({socket,state,actions}){return[
	node_dom("div[className=box]",null,[
		node_dom("p",null,[
			node_dom("label[innerText=Titel: ]",null,[
				node_dom("input",{
					oninput: event=> actions.setTaskTitle(event.target.value),
					value: state.taskTitle,
				}),
			]),
		]),
		node_dom("p",null,[
			node_dom("label[innerText=Text: ]",null,[
				node_dom("input",{
					oninput: event=> actions.setTaskText(event.target.value),
					value: state.taskText,
				}),
			]),
		]),
		node_dom("p",null,[
			node_dom("button[innerText=ADD TODO]",{
				onclick:()=>{
					actions.addTask({
						id: Date.now(),
						title: state.taskTitle,
						text: state.taskText,
						finished: false,
					});
					actions.setView("tasks");
					actions.setTaskText("");
					actions.setTaskTitle("");
				},
			}),
			node_dom("button[innerText=Zurück]",{
				onclick:()=> actions.setView("tasks"),
			}),
			node_dom("button[innerText=Säubern]",{
				onclick:()=>{
					actions.setTaskText("");
					actions.setTaskTitle("");
				},
			}),
		]),
		
	]),
]}
function ViewEdit({state,actions,task}){return[
	node_dom("h1[className=withButton]",null,[
		node_dom("button[innerText=Back]",{
			onclick:()=>{
				actions.setView("tasks");
			},
		}),
		node_dom("span[innerText=Bearbeiten]"),
	]),
	node_dom("div[className=box]",null,[
		node_dom("p",null,[
			node_dom("label[innerText=Titel: ]",null,[
				node_dom("input",{
					oninput: event=> actions.editTask({
						id: task.id,
						title: event.target.value,
					}),
					value: task.title,
				}),
			]),
		]),
		node_dom("p",null,[
			node_dom("label[innerText=Text: ]",null,[
				node_dom("input",{
					oninput: event=> actions.editTask({
						id: task.id,
						text: event.target.value,
					}),
					value: task.text,
				}),
			]),
		]),
	]),
]}

init(()=>{
	const [state,actions]=hook_model(model);
	const socket=hook_memo(()=>{
		const token=getToken();
		const socket=io({
			path:"/bind/socket/TODO",
			auth: {token},
		});
		window.socket=socket;

		socket.on("error_code",code=>{
			if(code=="wrong-token"){
				alert("Sie sind NICHT angemeldet. Der Chat kann nur mit einem Account verwendet werden. Klicken Sie jetzt auf OK, um sich anzumelden!");
				location.href="/account?goto=TODO";
			}else{
				console.log("error code from server: "+code);
			}
		});
		socket.on("TODOs",tasks=>{
			console.log("get TODOs",tasks);
			actions.setTasks(tasks);
		});
		socket.on("connect",()=>{console.log("Connected as "+socket.id)})
		socket.on("disconnect",()=>{console.log("Disconnect")})

		return socket;
	});

	return[null,[
		state.view==="tasks"&&
		node(ViewTasks,{socket,state,actions}),

		state.view=="addTask"&&
		node(ViewAddTask,{socket,state,actions}),
		
		typeof(state.view)==="number"&&
		node(ViewEdit,{
			state, actions,
			task: state.tasks.find(item=>item.id===state.view),
		}),
	]];
});
