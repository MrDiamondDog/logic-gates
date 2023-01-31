var __awaiter=this&&this.__awaiter||function(t,n,r,p){return new(r=r||Promise)(function(i,e){function s(t){try{u(p.next(t))}catch(t){e(t)}}function o(t){try{u(p.throw(t))}catch(t){e(t)}}function u(t){var e;t.done?i(t.value):((e=t.value)instanceof r?e:new r(function(t){t(e)})).then(s,o)}u((p=p.apply(t,n||[])).next())})};import Node from"./node.js";class Utils{static powerColor(t){return t?"#34c13b":"#84423f"}static getTextWidth(e,i){var s=0;for(let t=0;t<i.length;t++)s+=e.measureText(i[t]).width;return s}static getTextHeight(t,e){t=t.measureText(e);return t.fontBoundingBoxAscent+t.fontBoundingBoxDescent}static circle(t,e,i,s,o){t.fillStyle=o,t.beginPath(),t.arc(e,i,s,0,2*Math.PI,!1),t.fill()}static circleContainsPoint(t,e,i,s,o){return Math.sqrt(Math.pow(t-i,2)+Math.pow(e-s,2))<o}static rectContainsPoint(t,e,i,s,o,u){return i<=t&&t<=i+o&&s<=e&&e<=s+u}static rectIntersectsRect(t,e,i,s,o,u,n,r){return t<o+n&&o<t+i&&e<u+r&&u<e+s}static bezierLine(t,e,i,s,o,u){t.strokeStyle=u,t.beginPath(),t.moveTo(e,i),t.bezierCurveTo(e-50,i,s+50,o,s,o),t.stroke()}static GetEmptySpace(e){let i=100,s=100,o=!0;for(;o;){o=!1;for(let t=0;t<this.nodes.length;t++){var u=this.nodes[t];if(this.rectIntersectsRect(i,s,200,200,u.x,u.y,u.width,u.height)){o=!0,(s+=50)>e.canvas.height-100&&(s=100,i+=50);break}}}return{x:i,y:s}}static CreateCustomNode(t,e,i=!0,s=void 0){var{x:o,y:u}=this.GetEmptySpace(t),n=this.nodes,r=(i&&(this.nodes=[]),[]),p=[];if(s)for(var a=0;a<s.length;a++)"Input"==s[a].title?r.push(s[a]):"Output"==s[a].title&&p.push(s[a]);i=new Node(t,s?{title:e,inputs:r.map(t=>t.id),outputs:p.map(t=>t.id),x:o,y:u,tooltip:"A custom node.",isCustom:!0,customNodes:s}:{title:e,inputs:this.inputs.map(t=>t.id),outputs:this.outputs.map(t=>t.id),x:o,y:u,tooltip:"A custom node.",isCustom:!0,customNodes:n});return s&&(i.x=o,i.y=u),this.nodes.push(i),i}static CreateNode(t,e,i=void 0,s=void 0){i&&s||(i=this.GetEmptySpace(t).x,s=this.GetEmptySpace(t).y);var o=this.letters["input"==e?this.inputs.length:"output"==e?this.outputs.length+13:26];switch(e){case"Random":e=this.prebuiltNodes[Math.floor(Math.random()*this.prebuiltNodes.length)],this.CreateNode(t,e,i,s);break;case"or":this.nodes.push(new Node(t,{title:"OR",inputs:["A","B"],outputs:["C"],x:i,y:s,tooltip:"Outputs true if either input is true.",id:o},t=>[t[0].powered||t[1].powered]));break;case"and":this.nodes.push(new Node(t,{title:"AND",inputs:["A","B"],outputs:["C"],x:i,y:s,tooltip:"Outputs true if both inputs are true.",id:o},t=>[t[0].powered&&t[1].powered]));break;case"not":this.nodes.push(new Node(t,{title:"NOT",inputs:["A"],outputs:["B"],x:i,y:s,tooltip:"Outputs true if the input is false.",id:o},t=>[!t[0].powered]));break;case"input":12<this.inputs.length?alert("Input limit reached!"):this.nodes.push(new Node(t,{title:"Input",inputs:[],outputs:["A"],x:i,y:s,tooltip:"Outputs true if the input is true.",widgetOptions:[{type:"button",parentIOName:"A"}],id:o},(t,e)=>[e[0].powered]));break;case"output":12<this.outputs.length?alert("Output limit reached!"):this.nodes.push(new Node(t,{title:"Output",inputs:["A"],outputs:[],x:i,y:s,tooltip:"Outputs true if the input is true.",id:o},t=>[]));break;case"xor":this.nodes.push(new Node(t,{title:"XOR",inputs:["A","B"],outputs:["C"],x:i,y:s,tooltip:"Outputs true if one input is true and the other is false.",id:o},t=>[t[0].powered!=t[1].powered]));break;case"nand":this.nodes.push(new Node(t,{title:"NAND",inputs:["A","B"],outputs:["C"],x:i,y:s,tooltip:"Outputs true if both inputs are false.",id:o},t=>[!(t[0].powered&&t[1].powered)]));break;case"nor":this.nodes.push(new Node(t,{title:"NOR",inputs:["A","B"],outputs:["C"],x:i,y:s,tooltip:"Outputs true if both inputs are false.",id:o},t=>[!(t[0].powered||t[1].powered)]));break;case"xnor":this.nodes.push(new Node(t,{title:"XNOR",inputs:["A","B"],outputs:["C"],x:i,y:s,tooltip:"Outputs true if both inputs are the same.",id:o},t=>[t[0].powered==t[1].powered]))}}static sleep(t){return __awaiter(this,void 0,void 0,function*(){return Promise.resolve(setTimeout(()=>{},t))})}}Utils.letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ ",Utils.backgroundColor="#212d38",Utils.accentColor="#2f3e4e",Utils.accentColor2="#3f4e5e",Utils.highlightColor="#2d5b8a",Utils.selectColor="rgba(4, 122, 239, 0.25)",Utils.textColor="#ffffff",Utils.footerTextColor="#909090",Utils.nodes=[],Utils.inputs=[],Utils.outputs=[],Utils.contextMenu=void 0,Utils.selectedNode=void 0,Utils.selectedNodes=[],Utils.selectingMultiple=!1,Utils.prebuiltNodes=["Random","input","output","or","nor","xor","and","xnor","nand","not"],Utils.mouse={x:0,y:0,dragging:!1,draggingNode:null,draggingIO:void 0,hoveringInput:void 0,hoveringOutput:void 0,dragOffset:{x:0,y:0},dragStart:{x:0,y:0},selecting:!1,clicking:!1};export default Utils;