window.GM=GM||{};var GM=window.GM;GM.gameManager=null,GM.mapManager=null,GM.enemyManager=null,GM.popupList=[],Array.prototype.contains=function(r,n){for(var e=this.length;e--;)if(n){if(n(this[e],r))return!0}else if(this[e]===r)return!0;return!1},Array.prototype.removeByValue=function(r){for(var n=0;n<this.length;n++)if(this[n]==r)return this.splice(n,1)};