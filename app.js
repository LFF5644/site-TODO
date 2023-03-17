/**
	@type {typeof import('lui/index')}
*/
const lui=window.lui;
const {
	init,
	//node,
	node_dom,
	//node_map,
	hook_memo,
	hook_model,
	//hook_effect,
}=lui;

const model={
	init:()=>({

	}),
};

init(()=>{
	const [state,actions]=hook_model(model);
	const socket=hook_memo(()=>{
		const socket=io({path:"/bind/socket/TODO"});
		window.socket=socket;
		return socket;
	});
	return[null,[
		node_dom("h1[innerText=TODO!][style=color:green]"),
		node_dom("p[innerText=Update wird geschrieben]"),
	]];
});
