"use strict"
// SVG
var h, w, svgw, svgh, svg, svgNode, mobile, container;
const RATIO = .65;

// BOARD
var board = [], dim;
const gap = 0;
const cols = 30;
const rows = parseInt(cols * RATIO);
 
var init = () => {
	initBoard();
	initSVG();
	initDraw();
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
	dim = svgw / cols;
}

var initBoard = () => {
	for(var i = 0; i < cols * rows; i++) {
		board[i] = Math.round( Math.random() - .2);
	}
}

var handleClick = () => {
	var pos = d3.mouse(svg.node());
	var x = Math.floor(pos[0] / dim);
	var y = Math.floor(pos[1] / dim);
	var id = x + y * cols;
	var alive = board[id];
	//board[id] = alive ? 0 : 1;
	//update(id, !alive);
	console.log(getNeighbours(id))
}

var initDraw = () => {
	svg.selectAll("g")
		.data( board )
		.enter()
			.append("g")
			.attr("transform", 
					(d, i) => {
							var x = ( i % cols ) * dim + gap;
							var y = parseInt(i / cols) * dim + gap;
							return `translate(${x}, ${y})`;
						}
					)
			.append("rect")
			.attr("id", (d, i) => "c" + i)
			.attr("width", dim - gap)
			.attr("height", dim - gap)
			.attr("fill", d => d? "#fff" : "#333");
}

var update = (id, alive) => {
	svg.select(`#c${id}`)
		.attr("fill", () => alive ? "#fff" : "#333");
}

var nextGen = () => {

}

var alive = (x, y) => {

}


var getNeighbours = (id) => {
	var neighbours = [];
	for(var i = -1; i < 2; i++) {
		var index = id + i * cols;
		neighbours.push(
			( index != id ? 
				board[ index ] : 0 ),
			board[ index + 1 ], 
			board[ index - 1 ]
		)				
	}
	return neighbours.filter(el => el != undefined)
					 .reduce( (a, b) => a + b);
}

init();

