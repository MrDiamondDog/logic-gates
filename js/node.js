import IO from"./io.js";import Tooltip from"./tooltip.js";import Utils from"./utilities.js";import{Widget,ButtonWidget}from"./widgets.js";class Node{constructor(t,s,i=void 0){this.selected=!1,this.widgetOptions=[],this.widgets=[],this.isCustom=!1,this.customNodes=[],this.ctx=t,this.settings=s,this.title=s.title,s.inputs[0]instanceof IO?this.inputs=s.inputs:this.inputs=s.inputs.map((t,s)=>new IO(t,!1,s,this)),s.outputs[0]instanceof IO?this.outputs=s.outputs:this.outputs=s.outputs.map((t,s)=>new IO(t,!0,s,this)),this.isCustom=s.isCustom||void 0!==s.customNodes,this.customNodes=s.customNodes||[],this.predicate=i||void 0,this.x=s.x,this.y=s.y,this.tooltip=s.tooltip,this.widgetOptions=s.widgetOptions||[],this.id=s.id||void 0,this.ctx.font="30px monospace",this.width=Utils.getTextWidth(this.ctx,this.title)+20,this.height=Math.max(25*this.inputs.length,25*this.outputs.length)+35,this.widgets=this.widgetOptions.map((t,s)=>new("button"===t.type?ButtonWidget:Widget)(this.ctx,this.findIO(t.parentIOName)))}draw(){this.ctx.font="30px monospace",this.ctx.fillStyle=Utils.accentColor,this.ctx.fillRect(this.x,this.y,this.width,this.height),this.selected&&(this.ctx.strokeStyle=Utils.highlightColor,this.ctx.lineWidth=3,this.ctx.strokeRect(this.x,this.y,this.width,this.height)),this.ctx.fillStyle=Utils.textColor,this.ctx.fillText(this.title,this.x+10,this.y+30);for(let t=0;t<this.inputs.length;t++)this.inputs[t].draw(this.ctx,this.x,this.y);for(let t=0;t<this.outputs.length;t++)this.outputs[t].draw(this.ctx,this.x+this.width,this.y);for(let t=0;t<this.widgets.length;t++)this.widgets[t].draw();this.ctx.font="15px monospace",this.ctx.fillStyle=Utils.footerTextColor,this.id&&this.ctx.fillText(this.id,this.x+this.width/2-Utils.getTextWidth(this.ctx,this.id)/2,this.y+this.height-7)}update(t=!0){if(this.predicate){var s=this.predicate(this.inputs,this.widgets);for(let t=0;t<this.outputs.length;t++)this.outputs[t].powered=s[t],this.outputs[t].update();for(let t=0;t<this.inputs.length;t++)this.inputs[t].update()}if(this.isCustom){var i=[],e=[];for(let t=0;t<this.customNodes.length;t++)"Input"==this.customNodes[t].title?i.push(this.customNodes[t]):"Output"==this.customNodes[t].title&&e.push(this.customNodes[t]);for(let t=0;t<this.inputs.length;t++)i[t].widgets[0].setPowered(this.inputs[t].powered);for(let t=0;t<this.customNodes.length;t++)this.customNodes[t].update(!1);for(let t=0;t<this.outputs.length;t++)this.outputs[t].powered=e[t].inputs[0].powered;for(let t=0;t<this.customNodes.length;t++)this.customNodes[t].update(!1)}for(let t=0;t<this.inputs.length;t++)this.inputs[t].update();for(let t=0;t<this.outputs.length;t++)this.outputs[t].update();if(t){this.draw();t=Utils.rectContainsPoint(Utils.mouse.x,Utils.mouse.y,this.x,this.y,this.width,this.height);if(!Utils.mouse.draggingNode&&!Utils.mouse.draggingIO)for(var o=0;o<this.widgets.length;o++)this.widgets[o]instanceof ButtonWidget&&Utils.circleContainsPoint(Utils.mouse.x,Utils.mouse.y,this.widgets[o].x,this.widgets[o].y,8)&&Utils.mouse.clicking&&this.widgets[o].setPowered(!this.widgets[o].powered);if(!Utils.mouse.draggingNode){let t;Utils.mouse.hoveringInput?t=new Tooltip(Utils.mouse.hoveringInput.name):Utils.mouse.hoveringOutput?t=new Tooltip(Utils.mouse.hoveringOutput.name):this.tooltip,t&&t.draw(this.ctx,Utils.mouse.x,Utils.mouse.y)}Utils.mouse.hoveringInput||Utils.mouse.hoveringOutput||Utils.mouse.draggingIO||(t&&Utils.mouse.clicking&&!Utils.mouse.draggingNode&&(Utils.mouse.draggingNode=this,Utils.mouse.dragOffset={x:Utils.mouse.x-this.x,y:Utils.mouse.y-this.y}),Utils.mouse.draggingNode===this&&this.move(Utils.mouse.x-Utils.mouse.dragOffset.x,Utils.mouse.y-Utils.mouse.dragOffset.y)),(Utils.mouse.hoveringInput||Utils.mouse.hoveringOutput||Utils.mouse.draggingIO)&&!Utils.mouse.draggingNode&&(Utils.mouse.clicking&&!Utils.mouse.draggingIO&&(Utils.mouse.draggingIO=Utils.mouse.hoveringInput||Utils.mouse.hoveringOutput),Utils.mouse.draggingIO&&Utils.bezierLine(this.ctx,Utils.mouse.x,Utils.mouse.y,Utils.mouse.draggingIO.x,Utils.mouse.draggingIO.y,Utils.textColor),!Utils.mouse.clicking)&&Utils.mouse.draggingIO&&(Utils.mouse.hoveringInput?Utils.mouse.draggingIO.connect(Utils.mouse.hoveringInput):Utils.mouse.hoveringOutput&&Utils.mouse.hoveringOutput.connect(Utils.mouse.draggingIO),Utils.mouse.draggingIO=void 0)}}move(t,s){this.x=t,this.y=s}contains(t,s){return Utils.rectContainsPoint(t,s,this.x,this.y,this.width,this.height)}intersects(t,s,i,e){return Utils.rectIntersectsRect(t,s,i,e,this.x,this.y,this.width,this.height)}findIO(s){for(let t=0;t<this.inputs.length;t++)if(this.inputs[t].name===s)return this.inputs[t];for(let t=0;t<this.outputs.length;t++)if(this.outputs[t].name===s)return this.outputs[t]}delete(){for(let t=0;t<this.inputs.length;t++)this.inputs[t].delete();for(let t=0;t<this.outputs.length;t++)this.outputs[t].delete();Utils.nodes.splice(Utils.nodes.indexOf(this),1)}}export default Node;