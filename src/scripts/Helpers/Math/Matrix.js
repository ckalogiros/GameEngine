//===================== Orthographic Matrix =====================
// | left-right 	| 0				| 0							| 0 |
// | 0				| top - bottom	|								| 0 |
// |					|					| zFar - zNear				| 0 |

import { AddArr2 } from "./MathOperations.js";

// |-(r+l)/(r-l)|-(t+b) / (t-b) |-(zFar+zNear)/(zFar-zNear)	| 1 |
export function Mat4Orthographic(left, right, bottom, top, zNear, zFar) {

	const out = [
		2.0 / (right - left),
		0.0,
		0.0,
		0.0,
		0.0,
		2.0 / (top - bottom),
		0.0,
		0.0,
		0.0,
		0.0,
		-2.0 / (zFar - zNear),
		0.0,
		-(right + left) / (right - left),
		-(top + bottom) / (top - bottom),
		-(zFar + zNear) / (zFar - zNear),
		1.0
	]
	return out;
}

class Mat4x4 {
	constructor() {

	}
};

// function Mult(mat4, vec2){
// 	const res = [
// 		(  mat4[0] *   -vec2[0]) + (  mat4[1] *   -vec2[0]) + (  mat4[2] *  vec2[0]) + (  mat4[3] *   vec2[0]),
// 		(  mat4[0] *   vec2[1]) + (  mat4[1] *   -vec2[1]) + (  mat4[2] *  vec2[1]) + (  mat4[3] *   -vec2[1]),

// 		(  mat4[4] *   -vec2[0]) + (  mat4[5] *   -vec2[0]) + (  mat4[6] *  vec2[0]) + (  mat4[7] *   vec2[0]),
// 		(  mat4[4] *   vec2[1]) + (  mat4[5] *   -vec2[1]) + (  mat4[6] *  vec2[1]) + (  mat4[7] *   -vec2[1]),

// 		(  mat4[8] *   -vec2[0]) + (  mat4[9] *   -vec2[0]) + (  mat4[10] *  vec2[0]) + (  mat4[11] *   vec2[0]),
// 		(  mat4[8] *   vec2[1]) + (  mat4[9] *   -vec2[1]) + (  mat4[10] *  vec2[1]) + (  mat4[11] *   -vec2[1]),

// 		(  mat4[12] *   -vec2[0]) + (  mat4[13] *   -vec2[0]) + (  mat4[14] *  vec2[0]) + (  mat4[15] *  vec2[0]),
// 		(  mat4[12] *   vec2[1]) + (  mat4[13] *   -vec2[1]) + (  mat4[14] *  vec2[1]) + (  mat4[15] *   -vec2[1]),
// 	];
// 	return res;
// }
function Mult(mat4, vec2) {
	// 	const res = [
	// 		(  mat4[0] *   vec2[0]) + (  mat4[1] *   vec2[0]) + (  mat4[2] *  vec2[0]) + (  mat4[3] *   vec2[0]),
	// 		(  mat4[0] *   vec2[1]) + (  mat4[1] *   vec2[1]) + (  mat4[2] *  vec2[1]) + (  mat4[3] *   vec2[1]),

	// 		(  mat4[4] *   vec2[0]) + (  mat4[5] *   vec2[0]) + (  mat4[6] *  vec2[0]) + (  mat4[7] *   vec2[0]),
	// 		(  mat4[4] *   vec2[1]) + (  mat4[5] *   vec2[1]) + (  mat4[6] *  vec2[1]) + (  mat4[7] *   vec2[1]),

	// 		(  mat4[8] *   vec2[0]) + (  mat4[9] *   vec2[0]) + (  mat4[10] *  vec2[0]) + (  mat4[11] *   vec2[0]),
	// 		(  mat4[8] *   vec2[1]) + (  mat4[9] *   vec2[1]) + (  mat4[10] *  vec2[1]) + (  mat4[11] *   vec2[1]),
	
	// 		(  mat4[12] *   vec2[0]) + (  mat4[13] *   vec2[0]) + (  mat4[14] *  vec2[0]) + (  mat4[15] *  vec2[0]),
	// 		(  mat4[12] *   vec2[1]) + (  mat4[13] *   vec2[1]) + (  mat4[14] *  vec2[1]) + (  mat4[15] *  vec2[1]),
	// 	];
	/**
	 	0 1 2 
		4 5 6 7 
		8 9 10 
		15
	 */ 
	const res = [ 
		mat4[0]*vec2[0] + mat4[1]*vec2[0] + mat4[2]*vec2[0], 
		mat4[0]*vec2[0] + mat4[1]*vec2[0] + mat4[2]*vec2[0], 
		mat4[4]*vec2[0] + mat4[5]*vec2[0] + mat4[6]*vec2[0] + mat4[7]*vec2[0], 
		mat4[4]*vec2[0] + mat4[5]*vec2[0] + mat4[6]*vec2[0] + mat4[7]*vec2[0], 
		mat4[8]*vec2[0] + mat4[9]*vec2[0] + mat4[10]*vec2[0],
		mat4[8]*vec2[0] + mat4[9]*vec2[0] + mat4[10]*vec2[0],
		mat4[15]*vec2[0],
		mat4[15]*vec2[0],
	];
	return res;
}

export function Rotate2D(dim, pos, angle) {
	const rot = [
		Math.cos(angle), Math.sin(angle),
		-Math.cos(angle), Math.sin(angle),
	];
	const newPos = [
		(rot[0] * pos[0]) + (rot[1] * pos[1]),
		(rot[2] * pos[0]) + (rot[3] * pos[1]),
	];
	return newPos;
};


/** Vertex Pos Schema
	-dim[0];0  dim[1];1 
	-dim[0];2 -dim[1];3
	 dim[0];4  dim[1];5 
	 dim[0];6 -dim[1];7
 */
export function Rotate4x4(dim, pos, angle) {

	const c = Math.cos(angle);
	const s = Math.sin(angle);

	const p = AddArr2(dim, pos)

	const yaw = [
		1, c, -s, 0, // 0 1 2 4 5 6 7 8 9 10 15
		0,  s, c, 0,
		0,  0, 1, 0,	
		0,  0, 0, 1,	
	];
	const pitch = [
		c, 0, s, 0,
		0, 1, 0, 0,
		-s, 0, c, 0,
		0, 0, 0, 1,
	];
	const rol = [
		1, 0,  0, 0,
		0, c, -s, 0,
		0, s,  c, 0,	
		0, 0,  0, 1,	
	];
	// const pitch = [
	// 	-s, 0, c, 0,	
	// 	0, 1, 0, 0,
	// 	c, 0, s, 0,
	// 	0, 0, 0, 1,	
	// ];
	// const rol = [
	// 	1, 1, 1, 0,
	// 	1, c, -s, 0,
	// 	1, s, c, 0,
	// 	1, 1, 1, 1,
	// ];
	// const yaw = [
	// 	c, -s, -s, 0,
	// 	s, c, 0, 0,
	// 	s, 0, c, 0,
	// 	0, 0, 0, 1,
	// ];

	let newPos = Mult(yaw, p);
	// newPos = Mult(yaw, newPos);
	// newPos = Mult(rol, newPos);

	// const newPos = [
	// 	(rot[0] * pos[0]) + (rot[1] * pos[1]),
	// 	(rot[2] * pos[0]) + (rot[3] * pos[1]),
	// ];
	// const newPos = [
	// 	(rot[0] *  pos[0]) + (rot[1] *  pos[0]) + (rot[2] * pos[0]) + (rot[3] *  pos[0]),
	// 	(rot[0] *  pos[1]) + (rot[1] *  pos[1]) + (rot[2] * pos[1]) + (rot[3] *  pos[1]),

	// 	(rot[4] *  pos[0]) + (rot[5] *  pos[0]) + (rot[6] * pos[0]) + (rot[7] *  pos[0]),
	// 	(rot[4] *  pos[1]) + (rot[5] *  pos[1]) + (rot[6] * pos[1]) + (rot[7] *  pos[1]),

	// 	(rot[8] *  pos[0]) + (rot[9] *  pos[0]) + (rot[10] * pos[0]) + (rot[11] *  pos[0]),
	// 	(rot[8] *  pos[1]) + (rot[9] *  pos[1]) + (rot[10] * pos[1]) + (rot[11] *  pos[1]),

	// 	(rot[12] *  pos[0]) + (rot[13] *  pos[0]) + (rot[14] * pos[0]) + (rot[15] * pos[0]),
	// 	(rot[12] *  pos[1]) + (rot[13] *  pos[1]) + (rot[14] * pos[1]) + (rot[15] *  pos[1]),
	// ];


	// const newPos = [
	// 	(rot[0] * -pos[0]) + (rot[1] * -pos[2]) + (rot[2] * pos[4]) + (rot[3] *  pos[6]),
	// 	(rot[0] *  pos[1]) + (rot[1] * -pos[3]) + (rot[2] * pos[5]) + (rot[3] * -pos[7]),

	// 	(rot[4] * -pos[0]) + (rot[5] * -pos[2]) + (rot[6] * pos[4]) + (rot[7] *  pos[6]),
	// 	(rot[4] *  pos[1]) + (rot[5] * -pos[3]) + (rot[6] * pos[5]) + (rot[7] * -pos[7]),

	// 	(rot[8] * -pos[0]) + (rot[9] * -pos[2]) + (rot[10] * pos[4]) + (rot[11] *  pos[6]),
	// 	(rot[8] *  pos[1]) + (rot[9] * -pos[3]) + (rot[10] * pos[5]) + (rot[11] * -pos[7]),

	// 	(rot[12] * -pos[0]) + (rot[13] * -pos[2]) + (rot[14] * pos[4]) + (rot[15] *  pos[6]),
	// 	(rot[12] *  pos[1]) + (rot[13] * -pos[3]) + (rot[14] * pos[5]) + (rot[15] * -pos[7]),
	// ];
	// const newPos = [
	// 	(rot[0] * -pos[0]) + (rot[1] * -pos[0]) + (rot[2] * pos[0]) + (rot[3] *  pos[0]),
	// 	(rot[0] *  pos[1]) + (rot[1] * -pos[1]) + (rot[2] * pos[1]) + (rot[3] * -pos[1]),

	// 	(rot[4] * -pos[0]) + (rot[5] * -pos[0]) + (rot[6] * pos[0]) + (rot[7] *  pos[0]),
	// 	(rot[4] *  pos[1]) + (rot[5] * -pos[1]) + (rot[6] * pos[1]) + (rot[7] * -pos[1]),

	// 	(rot[8] * -pos[0]) + (rot[9] * -pos[0]) + (rot[10] * pos[0]) + (rot[11] *  pos[0]),
	// 	(rot[8] *  pos[1]) + (rot[9] * -pos[1]) + (rot[10] * pos[1]) + (rot[11] * -pos[1]),

	// 	(rot[12] * -pos[0]) + (rot[13] * -pos[0]) + (rot[14] * pos[0]) + (rot[15] *  pos[0]),
	// 	(rot[12] *  pos[1]) + (rot[13] * -pos[1]) + (rot[14] * pos[1]) + (rot[1] * -pos[1]),
	// ];
	// const newPos = [
	// 	(rot[0] *  pos[0]) + (rot[1] *  pos[0]) + (rot[2] * pos[0]) + (rot[3] *  pos[0]),
	// 	(rot[0] *  pos[1]) + (rot[1] *  pos[1]) + (rot[2] * pos[1]) + (rot[3] *  pos[1]),

	// 	(rot[4] *  pos[0]) + (rot[5] *  pos[0]) + (rot[6] * pos[0]) + (rot[7] *  pos[0]),
	// 	(rot[4] *  pos[1]) + (rot[5] *  pos[1]) + (rot[6] * pos[1]) + (rot[7] *  pos[1]),

	// 	(rot[8] *  pos[0]) + (rot[9] *  pos[0]) + (rot[10] * pos[0]) + (rot[11] *  pos[0]),
	// 	(rot[8] *  pos[1]) + (rot[9] *  pos[1]) + (rot[10] * pos[1]) + (rot[11] *  pos[1]),

	// 	(rot[12] *  pos[0]) + (rot[13] *  pos[0]) + (rot[14] * pos[0]) + (rot[15] * pos[0]),
	// 	(rot[12] *  pos[1]) + (rot[13] *  pos[1]) + (rot[14] * pos[1]) + (rot[15] *  pos[1]),
	// ];
	// const newPos = [
	// 	(rot[0] *  pos[0]) + (rot[1] *  pos[2]) + (rot[2] * pos[4]) + (rot[3] *  pos[6]),
	// 	(rot[0] *  pos[1]) + (rot[1] *  pos[3]) + (rot[2] * pos[5]) + (rot[3] *  pos[7]),

	// 	(rot[4] *  pos[0]) + (rot[5] *  pos[2]) + (rot[6] * pos[4]) + (rot[7] *  pos[6]),
	// 	(rot[4] *  pos[1]) + (rot[5] *  pos[3]) + (rot[6] * pos[5]) + (rot[7] *  pos[7]),

	// 	(rot[8] *  pos[0]) + (rot[9] *  pos[2]) + (rot[10] * pos[4]) + (rot[11] *  pos[6]),
	// 	(rot[8] *  pos[1]) + (rot[9] *  pos[3]) + (rot[10] * pos[5]) + (rot[11] *  pos[7]),

	// 	(rot[12] *  pos[0]) + (rot[13] *  pos[2]) + (rot[14] * pos[4]) + (rot[15] *  pos[6]),
	// 	(rot[12] *  pos[1]) + (rot[13] *  pos[3]) + (rot[14] * pos[5]) + (rot[15] *  pos[7]),
	// ];
	return newPos;
};
function CreateRectVertexPos(pos){
	return [
		-pos[0],  pos[1], // v1 
		-pos[0], -pos[1], // v2
		 pos[0],  pos[1], // v3 
		 pos[0], -pos[1], // v4
	];
}
export function Rotate4x42(dim, angle) {

	const c = Math.cos(angle);
	const s = Math.sin(angle);
	const p = CreateRectVertexPos(dim);
	const r = [ c, -s, s, c, ];

	const newPos = [
		p[0]*r[0] + p[1]*r[2],
		p[0]*r[1] + p[1]*r[3],
		
		p[2]*r[0] + p[3]*r[2],
		p[2]*r[1] + p[3]*r[3],
		
		p[4]*r[0] + p[5]*r[2],
		p[4]*r[1] + p[5]*r[3],
		
		p[6]*r[0] + p[7]*r[2],
		p[6]*r[1] + p[7]*r[3],
	];

	return newPos;
};
