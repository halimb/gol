"use strict"
// SVG
var h, w, svgw, svgh, svg, 
	svgNode, mobile, container, RATIO;

var liveColor = "#212121";
var deadColor = "#fff";

// BOARD
var board = [], dim;
const gap = -1;
var duration = 300;
var playing = false;
var COLS, ROWS, generation, t;
 
var play = document.getElementById("play");
var reset = document.getElementById("reset");
var shuffle = document.getElementById("shuffle");
var fb = document.getElementById("fb");
var ff = document.getElementById("ff");

play.onclick = () => {
	play.className = playing? "icon-play" : "icon-pause";
	playing = !playing;
	if(playing) {
		playing = true;
		tick();
	}
}

reset.onclick = () => { reset(true) }

shuffle.onclick = () => { reset(false) }

var reset = (empty) => {
	play.className = "icon-play";
	playing = false;
	if(empty) {
		clearBoard();
	} else {
		clearBoard();
		initBoard();
		initDraw();	
		tick();
	}
}



var init = () => {
	initSVG();
	initBoard();
	initDraw();
}

window.onresize = initSVG;
var initSVG = () => {
	h = window.innerHeight;
	w = window.innerWidth;
	mobile = h > w;
	RATIO = mobile ? .55 : .45;
	COLS = mobile ? 30 : 70;
	ROWS = parseInt(COLS * RATIO);
	svgw = mobile ? RATIO * w * 2.5 :  w;
	dim = svgw / COLS;
	svgh = mobile ? (svgw * RATIO): ROWS * dim;
	if( !svg ) {
		svg = d3.select("#container")
				.append("svg")
				.attr("class", () => mobile ? "svg mobile" : "svg")
		container = d3.select("#container")
					.on("click", handleClick);	
	}
	svg.attr("width", svgw)
		.attr("height", svgh);
}

var initBoard = () => {
	generation = 0;
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
	board = board.map(el => el * 0);
	svg.selectAll("rect")
		.attr("fill", deadColor);
}

var handleClick = () => {
	var pos = d3.mouse(svg.node());
	var x = Math.floor(pos[0] / dim);
	var y = Math.floor(pos[1] / dim);
	var id = x + y * COLS;
	// var alive = board[id];
	//board[id] = alive ? 0 : 1;
	//update(id, !alive);
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
			.attr("fill", d => d? liveColor : deadColor);
}

var tick = () => {
	var changing = []; 
	for(var id = 0; id < board.length; id++) {
		if(!isEdge(id) && isChanging(id)) {
			changing.push(id);
		}
	}
	for(var i = 0; i < changing.length; i++) {
		toggleCell(changing[i]);
	}

	if(changing.length != 0 && playing) {
		t = window.setTimeout(tick, duration)
	} else {
		window.clearTimeout(t);
	}
}


var toggleCell = (id) => {
	board[id] = !board[id];
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

