  
function readDeviceOrientation() {
                 		
    if (Math.abs(window.orientation) === 90) {
        // Landscape
        document.getElementById("orientation").innerHTML = "LANDSCAPE";
    } else {
    	// Portrait
    	document.getElementById("orientation").innerHTML = "PORTRAIT";
    }
}

window.onorientationchange = readDeviceOrientation;