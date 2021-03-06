"use strict"
// SVG
var h, w, svgw, svgh, svg, 
	svgNode, mobile, container, RATIO;

var liveColor = "#212121";
var deadColor = "#fff";

// BOARD
var board = [], dim;
const gap = 0;
var duration = 200;
var playing = false;
var clicked = false;
var brushing = true;
var COLS, ROWS, generation, t;
 
var play = document.getElementById("play");
var reset = document.getElementById("reset");
var shuffle = document.getElementById("shuffle");
var fb = document.getElementById("fb");
var ff = document.getElementById("ff");
var gen = document.getElementById("gen");
var speed = document.getElementById("speed");
var brush = document.getElementById("brush");
var erase = document.getElementById("erase");

play.onclick = togglePlay;

function togglePlay() {
	play.className = playing? "icon-play" : "icon-pause";
	playing = !playing;
	if(playing) {
		tick();
	}
}

ff.onclick = () => {
	if( duration > 50 ) {
		duration /= 2;
		updateDuration();
	}
}

fb.onclick = () => {
	if( duration < 800 ) {
		duration *= 2;
		updateDuration();
	}
}

reset.onclick = () => { reset(true) }

shuffle.onclick = () => { reset(false) }

brush.onclick = () => {
	if( ! brushing ) {
		brushing = true;
		erase.className = "icon-cancel-outline";
		brush.className = "icon-brush selected";
	}
}

erase.onclick = () => {
	if( brushing ) {
		brushing = false;
		brush.className = "icon-brush";
		erase.className = "icon-cancel-outline selected";
	}
}

var reset = (empty) => {
	play.className = "icon-play";
	if(empty) {
		clearBoard();
	} else {
		playing = true;
		clearBoard();
		initBoard();
		initDraw();	
		tick();
	}
	playing = false;
}

var updateDuration = () => {
	speed.innerHTML = `speed: ${2 / (duration / 100)}x`
}

var init = () => {
	container = d3.selectAll("#container")
				.on("mousedown", handleMouseDown)
				.on("touchstart", handleMouseDown)

				.on("mousemove", handleMouseMove)
				.on("touchmove", handleMouseMove)	
				
				.on("mouseleave", handleMouseUp)
				.on("touchend", handleMouseUp)
				.on("mouseup", handleMouseUp)

				.on("click", handleClick);


	initSVG();
	initBoard();
	initDraw();
}

window.onresize = () => {
	d3.select("svg").remove();
	initSVG();
	initBoard();
	initDraw();
}

var initSVG = () => {
	h = window.innerHeight;
	w = window.innerWidth;
	mobile = h > w;
	dim =  mobile ? 15 : 15;
	svgw = w;
	svgh = mobile ? h * .875 : h * .9;

	COLS = parseInt( svgw / dim );
	ROWS = parseInt( svgh / dim );

	svg = container.append("svg")
				.attr("class", () => mobile ? "svg mobile" : "svg")
				.attr("width", svgw)
				.attr("height", svgh);

}

function zoomed() {
  svg
      .translate(zoom.translate());
}


var initBoard = () => {
	generation = 0;
	board = [];
	for(var i = 0; i < COLS * ROWS; i++) {
		if(isEdge(i)) {
			board[i] = 0;
		}
		else {
			board[i] = Math.round( Math.random() - .2);
		}
	}
}

var clearBoard = () => {
	generation = 0;
	window.clearTimeout(t)
	updateGen();
	board = board.map(el => el * 0);
	svg.selectAll("rect")
		.attr("fill", deadColor);
}

var handleClick = () => {
	var pos = d3.mouse(svg.node());
	var x = Math.floor(pos[0] / dim);
	var y = Math.floor(pos[1] / dim);
	var id = x + y * COLS;
	toggleCell(id, true);
}

var handleMouseDown = () => {
	clicked = true;
}

var handleMouseMove = (e) => {
	if(clicked) {
		handleClick();
	}
}

var handleMouseUp = () => {
	clicked = false;
}

var initDraw = () => {
	svg.selectAll("g")
		.data( board )
		.attr("fill", d => d? liveColor : deadColor)
		.enter()
			.append("g")
			.attr("transform", 
					(d, i) => {
							var x = ( i % COLS ) * dim + gap;
							var y = parseInt(i / COLS) * dim + gap;
							return `translate(${x}, ${y})`;
						}
					)
			.append("rect")
			.attr("id", (d, i) => "c" + i)
			.attr("width", dim - gap)
			.attr("height", dim - gap)
			.attr("fill", d => d? liveColor : deadColor)
			.attr("stroke", "rgba(0,0,0,.2)");
}

var tick = () => {
	if(playing) {
		var changing = []; 
		for(var id = 0; id < board.length; id++) {
			if(!isEdge(id) && isChanging(id)) {
				changing.push(id);
			}
		}
		for(var i = 0; i < changing.length; i++) {
			toggleCell(changing[i]);
		}

		updateGen();

		t = window.setTimeout(tick, duration);
	}
}

var updateGen = () => {
	gen.innerHTML = `generation: ${generation++}`;
}


var toggleCell = (id, click) => {
	board[id] = click ? brushing : !board[id];
	svg.select(`#c${id}`)
		.attr("fill", () => board[id] ? liveColor : deadColor);
}

var isChanging = (id) => {
	var live = board[id];
	var change = false;
	var neighbours = getNeighbours(id);
	if(!live && neighbours == 3) {
		change = true;
	}
	else if(live && (neighbours < 2 || neighbours > 3) ) {
		change = true;
	}
	return change;
}

var isEdge = (id) => {
	return ( 	id < COLS || 
				id % COLS == 0 || 
				(id + 1) % COLS == 0 || 
				id > COLS * (ROWS - 1) );
}

var getNeighbours = (id) => {
	var neighbours = [], indexes = [];
	for(var i = -1; i < 2; i++) {
		var index = id + i * COLS;
		indexes.push(index);
		neighbours.push(
			board[ index - 1 ],
			( index != id ? 
				board[ index ] : 0 ),
			board[ index + 1 ] 
		)				
	}
	return neighbours.filter(el => el != undefined)
					 .reduce( (a, b) => a + b);
}

init();

