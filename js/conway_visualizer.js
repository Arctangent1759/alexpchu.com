var kBlockDim = 20;
var kBlockHTMLTemplate = "<div id='{id}' style = 'width:{width}px; height:{height}px; float:left; border-radius:"+Math.floor(kBlockDim/2)+"px;'></div>"

function GetBlockHTML(id, width, height) {
  return kBlockHTMLTemplate.replace('{id}',id).replace("{width}",width).replace("{height}",height)
}

function ConwayVisualizer(elem, period) {
  this.elem = elem;
  this.period = period;
  this.step_interval = false;
}


var kColor1;
var kColor2;
function GetColor(age) {
  if (age <=1) {
    return "#03A9F4";
  } else if (age <= 2) {
    return "#2196F3";
  } else if (age <= 4) {
    return "#3F51B5";
  } else if (age <= 8) {
    return "#673AB7";
  } else if (age <= 12) {
    return "#9C27B0";
  } else if (age <= 18) {
    return "#E91E63";
  }
}

ConwayVisualizer.prototype.Init = function() {
  if (this.step_interval != false) {
    clearInterval(this.step_interval);
  }
  this.container_width = this.elem.clientWidth
  this.container_height = this.elem.clientHeight
  this.num_blocks_x = Math.floor(this.container_width/kBlockDim);
  this.num_blocks_y = Math.floor(this.container_height/kBlockDim);
  this.padding_x = 0//Math.floor((this.container_width - (this.num_blocks_x * kBlockDim)) / (this.num_blocks_x + 1))
  this.padding_y = 0//Math.ceil((this.container_height - (this.num_blocks_y * kBlockDim)) / (this.num_blocks_y + 1))
  var inner_html = "";
  this.conway = new Conway(this.num_blocks_y, this.num_blocks_x);
  var visualizer = this;
  for (var y = 0; y < this.num_blocks_y; ++y) {
    inner_html += GetBlockHTML("h_seperator", this.padding_x, kBlockDim);
    for (var x = 0; x < this.num_blocks_x; ++x) {
      inner_html += GetBlockHTML(x+"_"+y, kBlockDim, kBlockDim);
      inner_html += GetBlockHTML("h_seperator", this.padding_x, kBlockDim);
    }
    inner_html += GetBlockHTML("v_seperator", this.container_width, this.padding_y);
  }
  this.elem.innerHTML = inner_html;
  function ToggleCell(){
    var x = Number(this.id.split("_")[0]);
    var y = Number(this.id.split("_")[1]);
    visualizer.conway.Toggle(y,x);
    visualizer.Redraw();
  }
  for (var y = 0; y < this.num_blocks_y; ++y) {
    for (var x = 0; x < this.num_blocks_x; ++x) {
      document.getElementById(x+"_"+y).onclick = ToggleCell;
    }
  }
  this.step_interval = setInterval(function(){visualizer.conway.Step(); visualizer.Redraw();},this.period);
  this.conway.RandomInit(0.25);
  this.Redraw();
}

ConwayVisualizer.prototype.Redraw = function() {
  for (var y = 0; y < this.num_blocks_y; ++y) {
    for (var x = 0; x < this.num_blocks_x; ++x) {
      var age = this.conway.Get(y,x);
      if (age) {
        document.getElementById(x+"_"+y).style.background=GetColor(age);
      } else {
        document.getElementById(x+"_"+y).style.background="#ECEFF1";
      }
    }
  }
}

ConwayVisualizer.prototype.Stop = function() {
  if (this.step_interval != false) {
    clearInterval(this.step_interval);
  }
  this.step_interval = false;
}

ConwayVisualizer.prototype.Resume = function() {
  var visualizer = this;
  this.step_interval = setInterval(function(){visualizer.conway.Step(); visualizer.Redraw();},this.period);
}
ConwayVisualizer.prototype.IsStopped = function() {
  return (this.step_interval == false)
}

document.addEventListener('DOMContentLoaded', function() {
  var visualizer = new ConwayVisualizer(document.getElementById("conway_visualizer"), 125);
  document.body.onresize = function() {
    visualizer.Init();
  }
  document.onkeyup = function(e) {
    if (e.keyCode == 32) {
      if (visualizer.IsStopped()){
        visualizer.Resume();
      } else {
        visualizer.Stop();
      }
    }
  }
  visualizer.Init();
});
