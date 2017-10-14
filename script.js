"use strict"
// SVG
var h, w, svgw, svgh, svg, 
	svgNode, mobile, container;
const RATIO = .65;

// BOARD
var board = [], dim;
const gap = 0;
const COLS = 30;
const ROWS = parseInt(COLS * RATIO);
 
var btn = document.getElementById("btn");
var init = () => {
	initBoard();
	initSVG();
	initDraw();
	btn.onclick = tick;
}

window.onresize = initSVG;
var initSVG = () => {
	h = window.innerHeight;
	w = window.innerWidth;
	mobile = h > w;
	if( mobile ) {
		svgh = RATIO * h;
		svgw = RATIO * svgh;
	} else {
		svgw = RATIO * w;
		svgh = svgw * RATIO;
	}
	if( !svg ) {
		svg = d3.select("#container")
				.append("svg")
				.attr("class", "svg")
		container = d3.select("#container")
					.on("click", handleClick);	
	}
	svg.attr("width", svgw)
		.attr("height", svgh);
	dim = svgw / COLS;
}

var initBoard = () => {
	for(var i = 0; i < COLS * ROWS; i++) {
		if(isEdge(i)) {
			board[i] = 0;
		}
		else {
			board[i] = Math.round( Math.random() - .2);
		}
	}
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
			.attr("fill", d => d? "#fff" : "#333");
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
	window.setTimeout(tick, 50);
}

var toggleCell = (id) => {
	board[id] = !board[id];
	svg.select(`#c${id}`)
		.attr("fill", () => board[id] ? "#fff" : "#333");
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

