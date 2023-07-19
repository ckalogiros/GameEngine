"use strict";
import { CalculateSdfOuterFromDim } from '../../../Helpers/Helpers.js';
import * as math from '../../../Helpers/Math/MathOperations.js'
import { FontGetUvCoords, FontGetFontDimRatio } from '../../Loaders/Font/Font.js'
// import { TextGeometry2D } from '../Geometry.js';
import { Rect2D } from '../Geometry/Rect2D.js';
import { Material } from '../Material.js';
import { Mesh } from '../Mesh.js'



export class Text {
	// sid;
	// pos = [0, 0, 0];
	// dim = [0, 0];
	// scale = [0, 0];
	// defPos = [0, 0, 0];
	// defDim = [0, 0];
	// defScale = [0, 0];
	// time = 0;
	
	numChars = 0; // Number of characters in the text
	text = ''; // The actual text. 

	faceWidth = 0; // Only for monospace fonts
	faceHeight = 0;
	textWidth = 0;


	letters = [];


	constructor(col, pos, fontSize, txt,  sdfInner, align){
		
		const faceHeight = fontSize * FontGetFontDimRatio();
		const textWidth = CalcTextWidth(txt, fontSize);
		const dim = [faceHeight, faceHeight];
		
		// super(pos, dim, [1, 1]);
		
		this.numChars 	 = txt.length;
		this.text 	 = txt;
		this.faceWidth = fontSize;
		this.faceHeight = faceHeight;
		this.textWidth = textWidth;
		// this.dim[1] = this.faceHeight; // The x dimention of the whole text is going to be calculated for each char in txt
		

		this.Align(align);
		this.CreateLetters(col, sdfInner)
	}

	Align(align){
		if (align & ALIGN.LEFT) { this.pos[0] += Viewport.left ; }
		else if (align & ALIGN.RIGHT) { this.pos[0] += Viewport.right - this.textWidth*2; }
		else if (align & ALIGN.CENTER_HOR) { this.pos[0] += (Viewport.width / 2) - this.textWidth; }
		if (align & ALIGN.TOP) { this.pos[1] += Viewport.top + this.faceHeight; }
		else if (align & ALIGN.BOTTOM) { this.pos[1] += Viewport.bottom - this.faceHeight; }
		else if (align & ALIGN.CENTER_VERT) { this.pos[1] += (Viewport.height / 2) - this.faceHeight; }
	}
	CreateLetters(col, sdfInner){
		// Use a dummy pos[0] so it's not ovewritten
		let posi = [0, 0, 0];
		math.CopyArr3(posi, this.pos)
		posi[0] += this.faceWidth;

		const sdfOuter = [sdfInner, CalculateSdfOuterFromDim(this.faceHeight, null)];
		
		// for (let i = 0; i < this.numChars; i++) {
		// 	// this.letters[i] = new Mesh(col, [this.faceWidth, this.faceHeight], SCALE_DEFAULT, FontGetUvCoords(this.text[i]), posi, this.style, null, null, sdfOuter);
		// 	const geom = new Rect2D(posi, [this.faceWidth, this.faceHeight]);
		// 	const mat = new Material(ORANGE_240_130_10, FontGetUvCoords(this.text[i]));
		// 	this.letters[i] = new Mesh(geom, mat, 0, null, sdfOuter, 'Text');
		// 	posi[0] += this.faceWidth * 2;
		// 	this.dim[0] += this.faceWidth;
		// }
		const geom = new TextGeometry2D(pos, [this.faceWidth, this.faceHeight], [1, 1]);
		// this.letters[i] = new Mesh(col, [this.faceWidth, this.faceHeight], SCALE_DEFAULT, FontGetUvCoords(this.text[i]), posi, this.style, null, null, sdfOuter);
		const mat = new Material(ORANGE_240_130_10, FontGetUvCoords(this.text[i]));
		this.letters = new Mesh(geom, mat, 0, null, sdfOuter, 'Text');
	}
	AddToGraphicsBuffer(sceneIdx){
		for (let i = 0; i < this.numChars; i++) {
			this.letters[i] = new Mesh(geom, mat, 0, null, sdfOuter, 'Text');
			posi[0] += this.faceWidth * 2;
			this.dim[0] += this.faceWidth;
		}
	}

}
// export class Text {
// 	// sid;
// 	// pos = [0, 0, 0];
// 	// dim = [0, 0];
// 	// scale = [0, 0];
// 	// defPos = [0, 0, 0];
// 	// defDim = [0, 0];
// 	// defScale = [0, 0];
// 	// time = 0;
	
// 	numChars = 0; // Number of characters in the text
// 	text = ''; // The actual text. 

// 	faceWidth = 0; // Only for monospace fonts
// 	faceHeight = 0;
// 	textWidth = 0;


// 	letters = [];


// 	constructor(col, pos, fontSize, txt,  sdfInner, align){
		
// 		const faceHeight = fontSize * FontGetFontDimRatio();
// 		const textWidth = CalcTextWidth(txt, fontSize);
// 		const dim = [faceHeight, faceHeight];
		
// 		// super(pos, dim, [1, 1]);
		
// 		this.numChars 	 = txt.length;
// 		this.text 	 = txt;
// 		this.faceWidth = fontSize;
// 		this.faceHeight = faceHeight;
// 		this.textWidth = textWidth;
// 		// this.dim[1] = this.faceHeight; // The x dimention of the whole text is going to be calculated for each char in txt
		

// 		this.Align(align);
// 		this.CreateLetters(col, sdfInner)
// 	}

// 	Align(align){
// 		if (align & ALIGN.LEFT) { this.pos[0] += Viewport.left ; }
// 		else if (align & ALIGN.RIGHT) { this.pos[0] += Viewport.right - this.textWidth*2; }
// 		else if (align & ALIGN.CENTER_HOR) { this.pos[0] += (Viewport.width / 2) - this.textWidth; }
// 		if (align & ALIGN.TOP) { this.pos[1] += Viewport.top + this.faceHeight; }
// 		else if (align & ALIGN.BOTTOM) { this.pos[1] += Viewport.bottom - this.faceHeight; }
// 		else if (align & ALIGN.CENTER_VERT) { this.pos[1] += (Viewport.height / 2) - this.faceHeight; }
// 	}
// 	CreateLetters(col, sdfInner){
// 		// Use a dummy pos[0] so it's not ovewritten
// 		let posi = [0, 0, 0];
// 		math.CopyArr3(posi, this.pos)
// 		posi[0] += this.faceWidth;

// 		const sdfOuter = [sdfInner, CalculateSdfOuterFromDim(this.faceHeight, null)];
		
// 		// for (let i = 0; i < this.numChars; i++) {
// 		// 	// this.letters[i] = new Mesh(col, [this.faceWidth, this.faceHeight], SCALE_DEFAULT, FontGetUvCoords(this.text[i]), posi, this.style, null, null, sdfOuter);
// 		// 	const geom = new Rect2D(posi, [this.faceWidth, this.faceHeight]);
// 		// 	const mat = new Material(ORANGE_240_130_10, FontGetUvCoords(this.text[i]));
// 		// 	this.letters[i] = new Mesh(geom, mat, 0, null, sdfOuter, 'Text');
// 		// 	posi[0] += this.faceWidth * 2;
// 		// 	this.dim[0] += this.faceWidth;
// 		// }
// 		const geom = new TextGeometry2D(pos, [this.faceWidth, this.faceHeight], [1, 1]);
// 		// this.letters[i] = new Mesh(col, [this.faceWidth, this.faceHeight], SCALE_DEFAULT, FontGetUvCoords(this.text[i]), posi, this.style, null, null, sdfOuter);
// 		const mat = new Material(ORANGE_240_130_10, FontGetUvCoords(this.text[i]));
// 		this.letters = new Mesh(geom, mat, 0, null, sdfOuter, 'Text');
// 	}
// 	AddToGraphicsBuffer(sceneIdx){
// 		for (let i = 0; i < this.numChars; i++) {
// 			this.letters[i] = new Mesh(geom, mat, 0, null, sdfOuter, 'Text');
// 			posi[0] += this.faceWidth * 2;
// 			this.dim[0] += this.faceWidth;
// 		}
// 	}

// }

/**
 * 
 * @param {*} txt : The string
 * @param {*} col : Float Array[4] 
 * @param {*} scale : Float Array[2]
 * @param {*} pos : Float Array[2]. The Position of the text
 * @param {*} display : True/False. Flag for if the text is displayable.
 * @param {*} Align : Left/Right/Top/Bottom in relation with the game window.
 * @returns : class Text
 */
export function CreateText(txt, col, pos, fontSize, sdfInner, align) {

	const text = new Text(col, pos, fontSize, txt,  sdfInner, align);
	return text;
}

export function CalcTextWidth(text, fontSize) {
	return text.length * fontSize;
}


