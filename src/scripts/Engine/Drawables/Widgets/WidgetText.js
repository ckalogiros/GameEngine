"use strict";

import { GlSetTex } from "../../../Graphics/Buffers/GlBufferOps.js";
import { GlGetContext } from "../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh, GlGetProgram } from "../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { CopyArr2, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { TimeIntervalsCreate, TimeIntervalsGetByIdx } from "../../Timers/TimeIntervals.js";
import { Geometry2D_Text } from "../Geometry/Geometry2DText.js";
import { FontMaterial } from "../Material/Material.js";
import { Text_Mesh } from "../Mesh.js";

/**
 * 
 * TODO: When we have to implement that the user decides for the font type (sdf...etc)
 * then the CalculateSdfOuterFromDim must:
 * 1. live in an if statment (if(fontType is sdf))
 * 2. move the function to the parent class instead of call it from all children classes of Text_Mesh
 */
export class Widget_Text extends Text_Mesh {

	constructor(text, pos, fontSize = 10, scale = [1, 1], color = WHITE, bold = 4) {

		const sdfouter = CalculateSdfOuterFromDim(fontSize);
		const mat = new FontMaterial(color, FONTS.SDF_CONSOLAS_LARGE, text, [bold, sdfouter])
		const geom = new Geometry2D_Text(pos, fontSize, scale, text, FONTS.SDF_CONSOLAS_LARGE);
		super(geom, mat);

		this.type |= MESH_TYPES.WIDGET_TEXT;
		this.type |= geom.type;
		this.type |= mat.type;
	}

}
/**
 * A widget of rendering static text 
 * in combination with dynamic text.
 */
export class Widget_Dynamic_Text extends Widget_Text {

	/** Set the max number of characters for the dynamic text, 
	 * by passing any text as 'maxDynamicTextChars' of length= dynamic text number of characters*/
	constructor(text, maxDynamicTextChars, pos, fontSize, scale, color1, color2, bold) {

		super(text, pos, fontSize, scale, color1, bold);

		// Translate the dynamic text by the width of the constant text's width
		pos[0] += (fontSize * 2 * text.length) + fontSize;
		const dynamicText = new Widget_Text(maxDynamicTextChars, pos, fontSize, scale, color2, bold);

		this.children.Init(text.length);
		this.children.Add(dynamicText);

		this.type |= MESH_TYPES.WIDGET_TEXT_DYNAMIC;
		this.type |= dynamicText.geom.type;
		this.type |= dynamicText.mat.type;
	}

	AddToGraphicsBuffer(sceneIdx) {

		/** Add the constant text */
		super.AddToGraphicsBuffer(sceneIdx);

		// dynText.geom.pos[1] += this.geom.pos[1] + this.geom.dim[1] * 2;

		/** Add the dynamic text to the graphics buffer */
		const dynText = this.children.buffer[0];
		dynText.gfx = GlGetContext(dynText.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
		const prog = GlGetProgram(dynText.gfx.prog.idx);
		if (dynText.sid.unif & SID.UNIF.BUFFER_RES) {
			const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
			prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
			prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
		}

		dynText.geom.AddToGraphicsBuffer(dynText.sid, dynText.gfx, dynText.name);
		dynText.mat.AddToGraphicsBuffer(dynText.sid, dynText.gfx);

		return [
			this.gfx,
			dynText.gfx,
		];
	}

	CreateDynamicText(maxDynamicTextChars, fontSize, color1, color2, pad, bold){

		// Get the last child mesh (suppose to be dynamicText)
		const lastChild = this.children.buffer[this.children.count-1];
		CHECK_ERROR(lastChild, ' @ Widget_Dynamic_Text.CreateDynamicText(). WidgetText.js');

		// Translate to right after the previous dynamicText.
		const pos = [0,0,0];
		CopyArr3(pos, lastChild.geom.pos); // Copy the dynamic's text mesh pos
		const prevXdim = ((lastChild.geom.dim[0] * 2 * lastChild.mat.text.length) - lastChild.geom.dim[0]);

		pos[0] += prevXdim + pad;
		const dynamicText = new Widget_Text(maxDynamicTextChars, pos, fontSize, [1,1], color2, bold);

		// Add the new dynamicText as a child of 'this'.
		const dynamicTextIdx = this.children.Add(dynamicText);

		/**
		 * TEMP: TODO: Abstract
		 * Cannot use 'AddToGraphicsBuffer()', so we must create another private function???
		 */
		const sceneIdx = 0;
		dynamicText.gfx = GlGetContext(dynamicText.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
		const prog = GlGetProgram(dynamicText.gfx.prog.idx);
		if (dynamicText.sid.unif & SID.UNIF.BUFFER_RES) {
			const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
			prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
			prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
		}

		dynamicText.geom.AddToGraphicsBuffer(dynamicText.sid, dynamicText.gfx, dynamicText.name);
		dynamicText.mat.AddToGraphicsBuffer(dynamicText.sid, dynamicText.gfx);

		// console.log('start 0:', this.children.buffer[0].gfx.vb.start);
		// console.log('start 1:', this.children.buffer[1].gfx.vb.start);

		this.type |= MESH_TYPES.WIDGET_TEXT_DYNAMIC;
		this.type |= dynamicText.geom.type;
		this.type |= dynamicText.mat.type;

		return dynamicTextIdx;
	}

	/**
	  * 
	  * @param {integer} msInterval The time interval in ms the dynamic text will be updated
	  * @param {callbackfunction} Func The function to call upon time interval
	  */
	SetDynamicText(msInterval, Func, name, idx = INT_NULL) {

		// Set an interval timer to update the fps uxi

		if(idx !== INT_NULL || this.children.count <= 1){
			const params = {
				Func: [Func], // Array in case we expand to have more dynamic texts
				meshes: null,
				
			};
			/* Choise of wether or not we add any new created dynamicText to be updated
				to the current Update function, called from TimeInterval.
				If the idx of the dynamic text is passed, then we create a new time interval
				and pass to the new update function(creates new timeInterval) the new dynamicText,
				else pass to the allready created update function all the dynamicText meshes (children buffer).
			 */

			// mesh: (idx !== INT_NULL) ? [this.children.buffer[idx]] : this.children,
			// mesh: (idx !== INT_NULL) ? [this.children.buffer[idx]] : this.children,
			/**
			 * The count takes a snapshot of the children count upon this function call.
			 * The idea is: for example this function is called for the first time
			 * with one dynamic text enabled, then count=1. At this time the idx is null,
			 * so to the interval function the whole buffer of children is passe as mesh.
			 * 
			 * When the Update function is called(via TimerInterval), we want to access 
			 * only the children present in the creation of the timeInterval, but the 
			 * Update function now hass all childen, including the ones added afterwards.
			 * 
			 * So we have a reference on to how many children(from the start) to update
			 * with the current Interval Update. 
			 * 
			 * TODO: What if we later add more than one dynamic text. Then we need to 
			 * pass a start index also??? 
			 */
			// count: this.children.count,
			// meshIndexes: [this.children.count-1],

			const meshes = [];
			if(idx === INT_NULL) meshes.push(this.children.buffer[0]); // At first call we deal with the first child mesh at index 0
			else meshes.push(this.children.buffer[idx]);
			params.meshes = meshes;

			const tIdx = TimeIntervalsCreate(msInterval, name, TIME_INTERVAL_REPEAT_ALWAYS, this.Update, params);
			this.timeIntervalsIdxBuffer.Add(tIdx);
		}
		else { // Update dynamicText via one timeIntrval Update().

			/**
			 * MAYBE BUG: Getting the 0 index timeInterval from timeIntervalsIdxBuffer assuming the bellow explanation.
			 *	If the same interval and update is going to be used, then we want the first timeInterval 
			 *	that was created which is the o-th element of this.timeIntervalsIdxBuffer.buffer[].
			 */
			const interval = TimeIntervalsGetByIdx(this.timeIntervalsIdxBuffer.buffer[0]);
			const oldFuncs = interval.clbkParams.params.Func;
			const oldMeshBuffer = interval.clbkParams.params.meshes;
			
			const params = {
				Func: [], // Array in case we expand to have more dynamicTexts
				meshes: interval.clbkParams.params.meshes, // all the dynamicTexts to be Updated by one timeInterval.
			};
			
			let i = 0;
			
			for(i=0; i<oldFuncs.length; i++){
				params.Func[i] = oldFuncs[i];
			}
			params.Func[i] = Func;
			
			for(i=0; i<oldMeshBuffer.length; i++){
				params.meshes[i] = oldMeshBuffer[i];
			}
			const curMeshIdx =  this.children.count-1;
			params.meshes[i] = this.children.buffer[curMeshIdx];
			console.log('Funcs:', params.Func)

			// Use initial interval time if user passes INT_NULL for 'msInterval' param, else use the new interval time.
			if(msInterval === INT_NULL) msInterval = interval.interval; 
			
			/** Destroy old timeInterval and create a new one with all the previous meshes and their callbacks */
			interval.Destroy();
			const tIdx = TimeIntervalsCreate(msInterval, name, TIME_INTERVAL_REPEAT_ALWAYS, this.Update, params);
			this.timeIntervalsIdxBuffer[0] = tIdx;
			console.log(interval)

		}

		/** Implementation: Changing the TimeInterval values and not destroy and create a new one */
		// else{
		// 	const interval = TimeIntervalsGetByIdx(this.timeIntervalsIdxBuffer.buffer[0])
		// 	interval.clbkParams.params.Func[1] = Func;
		// 	interval.clbkParams.params.count++;
		// 	console.log(interval)

		// }

		// const interval = TimeIntervalsGetByIdx(tIdx)
		// console.log(interval)
		
		// const func1 = interval.clbkParams.params.Func;

	}

	Update(params) { // TODO: Runs on every timeInterval. Make as efficient as possible

		const meshes = params.params.meshes;
		const mesheslen = meshes.length

		for (let i = 0; i < mesheslen; i++) {

			const val = params.params.Func[i]();

			const text = `${val}`;
			const geom = meshes[i].geom;
			const gfx  = meshes[i].gfx;
			const mat  = meshes[i].mat;

			let gfxInfo = new GfxInfoMesh(gfx);

			const textLen = text.length;
			const len = geom.numChars > textLen ? geom.numChars : (textLen > geom.numChars ? geom.numChars : textLen);

			// Update text faces
			for (let j = 0; j < len; j++) {

				let uvs = [0, 0, 0, 0];
				if (text[j] !== undefined) {
					uvs = FontGetUvCoords(mat.uvIdx, text[j]);
				}
				GlSetTex(gfxInfo, uvs);
				gfxInfo.vb.start += gfxInfo.vb.count
			}

		}
	}
}


