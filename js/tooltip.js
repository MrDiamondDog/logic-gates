import Utils from"./utilities.js";class Tooltip{constructor(t){this.text=t}draw(t,l,i){var e=Utils.getTextHeight(t,this.text)+20;t.font="20px monospace",t.fillStyle=Utils.accentColor2,t.fillRect(l,i-e,Utils.getTextWidth(t,this.text)+20,e),t.fillStyle=Utils.textColor,t.fillText(this.text,l+10,i+30-e)}}export default Tooltip;