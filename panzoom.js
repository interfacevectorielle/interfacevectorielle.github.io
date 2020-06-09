// Inital method to call to apply PanZoom to elements given a selector
function PanZoom(selector, opts) {
  let panZoomEles = []
  opts = opts || {};
  let minScale = (opts.minScale ? opts.minScale : 0.5);
  let maxScale = (opts.maxScale ? opts.maxScale : 30);
  let increment = (opts.increment ? opts.increment  : 0.05);
  let liner = (opts.liner ? opts.liner  : false);
  document.querySelectorAll(selector).forEach(function(ele){
    panZoomEles.push(new AttachPanZoom(ele, minScale , maxScale, increment, liner));
  });
  if(panZoomEles.length == 1)
    return panZoomEles[0];
  return panZoomEles;
}

//SLIDERS
	var slider = document.getElementById("slider");

	var zoomFactor = 0.1; //variable to be controlled

	var dispDiv = document.getElementById("dispDiv");
	dispDiv.innerHTML = zoomFactor*10;

//function is called when slider value changes
	slider.addEventListener("change", function() { 
  	zoomFactor = slider.value;  
  	dispDiv.innerHTML = zoomFactor*10;
	});

	
	/*var slider2 = document.getElementById("slider2");

	var dragFactor = 0.1; //variable to be controlled

	var dispDiv2 = document.getElementById("dispDiv2");
	dispDiv2.innerHTML = "Move speed: " + dragFactor*10;

//function is called when slider value changes
	slider2.addEventListener("change", function() { 
  	dragFactor = slider2.value;  
  	dispDiv2.innerHTML = "Move speed: " + dragFactor*10;
	});*/

// FUNCTION
// Appy PanZoom functionality to a given element, allow user defined zoom min and inc per scroll
function AttachPanZoom(ele, minScale, maxScale, increment, liner) {
  this.increment = increment;
  this.minScale = minScale;
  this.maxScale = maxScale;
  this.liner = liner;
  this.panning = false;
  this.oldX = this.oldY = 0;
  let self = this;
  ele.style.transform = "matrix(8, 0, 0, 8, -3510, -7810)";
  
  // Gets the current Scale, along with transX and transY
  this.getTransformMatrix = function() {
    let trans = ele.style.transform;
    let start = trans.indexOf("(") + 1;
    let end = trans.indexOf(")");
    let matrix = trans.slice(start, end).split(",");
    return { 
      "scale": +matrix[0], 
      "transX": +matrix[4], 
      "transY": +matrix[5] 
    }
  }

  // Given the scale, translateX and translateY apply to CSSS transform
  this.setTransformMatrix = function(o) {
    ele.style.transform = 'matrix('+o.scale+', 0, 0, '+o.scale+', '+o.transX+', '+o.transY+')';
  }

  this.applyTranslate = function(dx, dy){
    let newTrans = this.getTransformMatrix();
    newTrans.transX += dx*zoomFactor;//
    newTrans.transY += dy*zoomFactor;//***********************************************************
	this.setTransformMatrix(newTrans);
  } 

  // Applying Deltas to Scale and Translate transformations
  this.applyScale = function(dscale, x, y){
    let newTrans = this.getTransformMatrix();
    let width = ele.width ? ele.width : ele.offsetWidth;
    let height = ele.height ? ele.height : ele.offsetHeight;
    let tranX = x - (width / 2);
    let tranY = y - (height / 2);
    dscale = (this.liner ? dscale : dscale * (newTrans.scale)) // scale either liner or non-liner 
    newTrans.scale += dscale*zoomFactor;//*****************************************************
    let maxOrMinScale = (newTrans.scale <= this.minScale || newTrans.scale >= this.maxScale);
    if(newTrans.scale < this.minScale) newTrans.scale = this.minScale;
    if(newTrans.scale > this.maxScale) newTrans.scale = this.maxScale;
    if(!maxOrMinScale) {
		      this.applyTranslate(tranX, tranY);
		      this.setTransformMatrix(newTrans);
		/*if ((tranX < 4.6 && (tranX/(4.6-newTrans.scale)) >= -150) || (tranX >= 4.6 && (tranX/(4.6-newTrans.scale)) < -150)) {*/
		      this.applyTranslate(-(tranX * dscale), -(tranY * dscale));
			
    }
  }

  // Capture when the mouse is down on the element or not
  ele.addEventListener("mousedown", function(e) {
    e.preventDefault();
    this.panning = true;
    this.oldX = e.clientX;
    this.oldY = e.clientY;
  });
  
  ele.addEventListener("mouseup", function(e) { this.panning = false; });
  ele.addEventListener("mouseleave", function(e) { this.panning = false; });

  ele.addEventListener("mousemove", function(e){
    if(this.panning) {
      let deltaX = e.clientX - this.oldX;
      let deltaY = e.clientY - this.oldY;
      self.applyTranslate(deltaX, deltaY);
      this.oldX = e.clientX;
      this.oldY = e.clientY;
    }
  });

  this.getScrollDirection = function(e){
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    if(delta < 0)
      self.applyScale(-self.increment, e.offsetX, e.offsetY)
    else
      self.applyScale(self.increment, e.offsetX, e.offsetY);
  }

  ele.addEventListener('DOMMouseScroll',this.getScrollDirection,false);
  ele.addEventListener('mousewheel',this.getScrollDirection,false); 
}
