"use strict";

import { GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GfxInfoMesh } from "../../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../../Helpers/Helpers.js";
import { CopyArr2, CopyArr3 } from "../../../../Helpers/Math/MathOperations.js";
import { MouseGetPosDif } from "../../../Controls/Input/Mouse.js";
import { FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx, TimeIntervalsGetByIdx } from "../../../Timers/TimeIntervals.js";
import { Text_Mesh } from "../Text_Mesh.js";

/**
 * 
 * // TODO: When we have to implement that the user decides for the font type (sdf...etc)
 * then the CalculateSdfOuterFromDim must:
 * 1. live in an if statment (if(fontType is sdf))
 * 2. move the function to the parent class instead of call it from all children classes of Text_Mesh
 */
export class Widget_Text extends Text_Mesh {

	pad = [0, 0];

	constructor(text, pos, fontSize = 5, col = WHITE, bold = 4) {

		const sdfouter = CalculateSdfOuterFromDim(fontSize);
		if (sdfouter + bold > 1) bold = 1 - sdfouter;

		super(text, pos, fontSize, col)
		this.type |= MESH_TYPES_DBG.WIDGET_TEXT | this.type;

		// this.SetName('Text ' + text.slice(0, 7))
		this.SetName('Widget_Text:' + text)

	}

	/*******************************************************************************************************************************************************/
	// Graphics
	GenGfxCtx(FLAGS, gfxidx) {

		const gfx = super.GenGfxCtx(FLAGS, gfxidx);
		return gfx;
	}

	Render() {

		this.AddToGfx();
	}

	RenderToDebugGfx() {

		this.sid.progs_group = PROGRAMS_GROUPS.DEBUG.MASK;
	}

	/*******************************************************************************************************************************************************/
	// Alignment
	// Reposition_post(dif_pos) {

	//    this.MoveXYZ(dif_pos);
	// }

	Align_pre(target_mesh, flags, pad = [0, 0]) { // Align pre-added to the vertexBuffers

		const pos = [0, 0];
		const dim = this.geom.dim;
		CopyArr2(pos, this.geom.pos);
		let ypos = pos[1] + dim[1] * 2;

		if (flags & ALIGN.VERTICAL) {

			for (let i = 0; i < this.children.boundary; i++) {

				const child = this.children.buffer[i];
				pos[1] = ypos;

				child.geom.Reposition_pre(pos);
				ypos += child.geom.dim[1] * 2;
			}
		}


		if (flags & ALIGN.LEFT) {

			const pos = [0, 0];
			CopyArr2(pos, this.geom.pos);

			// Vertical allignment
			pos[1] = target_mesh.geom.pos[1];

			// Horizontal allignment
			pos[0] = (target_mesh.geom.pos[0] - target_mesh.geom.dim[0]) + (this.geom.dim[0]) + pad[0];

			CopyArr2(this.geom.pos, pos);

		}
		else if (flags & ALIGN.RIGHT) {

			const pos = [0, 0];
			CopyArr2(pos, this.geom.pos);

			// Vertical allignment
			pos[1] = target_mesh.geom.pos[1];

			// Horizontal allignment
			const num_faces = (this.geom.num_faces - 1 > 1) ? this.geom.num_faces - 1 : 1;
			pos[0] = (target_mesh.geom.pos[0] + target_mesh.geom.dim[0]) - (this.geom.dim[0] * 2 * num_faces) - pad[0];

			CopyArr2(this.geom.pos, pos);

		}
	}

	Reposition_post(dif_pos) {

		this.MoveXYZ(dif_pos)
		for (let i = 0; i < this.children.boundary; i++) {

			const child = this.children.buffer[i];
			child.MoveXYZ(dif_pos)
		}
	}

	/*******************************************************************************************************************************************************/
	// Transformations
	Move(x, y) {
		this.geom.MoveXY(x, y, this.gfx);
	}

}


/**
 * A widget of rendering static text 
 * in combination with dynamic text.
 */
// export class Widget_Dynamic_Text_Mesh extends Widget_Dynamic_Text_Mesh_Only {
export class Widget_Dynamic_Text_Mesh extends Widget_Text {

	/** Set the max number of characters for the dynamic text, 
	 * by passing any text as 'dynamic_text' of length= dynamic text number of characters*/
	constructor(text, dynamic_text, pos, fontSize, text_col1, text_col2, bold) {

		super(text, pos, fontSize, text_col1, bold);

		// Translate the dynamic text by the width of the constant text's width
		pos[0] += this.geom.CalcTextWidth();
		const dynamicText = new Widget_Text(dynamic_text, pos, fontSize, text_col2, bold);

		this.AddChild(dynamicText)

		this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | dynamicText.geom.type | dynamicText.mat.type;

	}

	Destroy() {

		for (let i = 0; i < this.children.boundary; i++) {

			if (this.children.buffer[i]) {
				this.children.buffer[i].Destroy();
			}
		}

		super.Destroy();
	}

	AddChild(text_mesh) {

		text_mesh.idx = this.children.Add(text_mesh);
		text_mesh.parent = this;
		return text_mesh.idx;
	}

	/*******************************************************************************************************************************************************/
	// GFX

	GenGfxCtx(FLAGS, gfxidx) {

		super.GenGfxCtx(FLAGS, gfxidx);
		for (let i = 0; i < this.children.boundary; i++) {

			const child = this.children.buffer[i];
			if (child) child.GenGfxCtx(FLAGS, gfxidx);
		}
		return this.gfx;
	}

	Render() {

		super.Render();
		for (let i = 0; i < this.children.boundary; i++) {

			const child = this.children.buffer[i];
			if (child) child.Render();
		}
	}

	RenderToDebugGfx() {

		this.sid.progs_group = PROGRAMS_GROUPS.DEBUG.MASK;
		for (let i = 0; i < this.children.boundary; i++) {
			const child = this.children.buffer[i];
			child.sid.progs_group = PROGRAMS_GROUPS.DEBUG.MASK;
		}
	}

	/*******************************************************************************************************************************************************/
	// Setters-Getters

	/** Return type: Array. Returns an array of all widgets meshes */
	GetAllMeshes(parent_meshes_buf) {

		const all_meshes = parent_meshes_buf ? parent_meshes_buf : [];
		all_meshes.push(this);
		for (let i = 0; i < this.children.boundary; i++) {

			const child = this.children.buffer[i];
			if (child) all_meshes.push(child);
		}
		return all_meshes;
	}

	GetTotalWidth() {
		let total_width = super.GetTotalWidth();
		for (let i = 0; i < this.children.boundary; i++) {
			// total_width += this.children.buffer[i].geom.dim[0] * this.children.buffer[i].geom.num_faces;
			total_width += this.children.buffer[i].GetTotalWidth();
		}

		return total_width;
	}

	GetTotalHeight() {
		return this.geom.dim[1];
	}

	SetColorAlpha(alpha) {

		super.SetColorAlpha(alpha);
		for (let i = 0; i < this.children.boundary; i++) {
			this.children.buffer[i].SetColorAlpha(alpha);
		}
	}

	RenderToDebugGfx() {

		this.sid.progs_group = PROGRAMS_GROUPS.DEBUG.MASK;
		for (let i = 0; i < this.children.boundary; i++) {
			const child = this.children.buffer[i];
			// child.sid.progs_group = PROGRAMS_GROUPS.DEBUG.MASK;
			child.RenderToDebugGfx();
		}
	}

	/**
	  * @param {integer} msInterval The time interval in ms the dynamic text will be updated
	  * @param {callbackfunction} func The function to call upon time interval
	  * See explanation at ##SetDynamicText
	  */
	SetDynamicText(name, msInterval, func, func_params = null, idx = INT_NULL) {

		if (idx !== INT_NULL || this.children.boundary <= 1) {
			/**
			 * The this.children.boundary takes a snapshot of the children count upon this function call.
			 * The idea is: for example uppon function call for the first time
			 * with one dynamic text mesh, the count=1. At this time the idx param is null,
			 * because it is the first call to the SetDynamicText() for this object instantiation.
			 * so we pass as param to the interval function, the whole buffer of children
			 * that currently has one mesh, that is the dynamicText mesh.
			 * 
			 * When the CreateNewText() is called to add a second dynamicText to 'this',
			 * we make a choise:
			 * 	1. Either we  create a new timeInterval for the new dynamicText.
			 * 	2. We use the same timeInterval from the first dynamicText (class instantiation).
			 * For the first case procedure is pretty much straight forward.
			 * For the second approach we destroy the timeInterval created by 
			 * the instantiation of the class and create a new one, passing the 2 dynamicTexts 
			 * as an array to the params parameter of the timeInterval call.
			 * Doing so, when the callback of the timeInterval is called, that is the this.Update() method,
			 * we will have 2 dynamicTexts to update with 2 different callbacks each,
			 * for the their text manipulation.
			 * 
			 */

			const params = {
				func: [func], // Array in case we expand to have more dynamic texts
				func_params: [func_params],
				meshes: null,
			};

			const meshes = [];
			if (idx === INT_NULL) meshes.push(this.children.buffer[0]); // At first call we deal with the first child mesh at index 0
			else meshes.push(this.children.buffer[idx]);
			params.meshes = meshes;

			const tIdx = TimeIntervalsCreate(msInterval, name, TIME_INTERVAL_REPEAT_ALWAYS, this.Update, params);
			this.timeIntervalsIdxBuffer.Add(tIdx);
		}
		else { // Update dynamicText via one timeIntrval Update().

			// Params for the new timeInterval.
			const params = {
				func: [], // All timeInterval's callbacks here
				func_params: [], /* These are the parameters NOT for the timeInterval and the 'this.Update()' 
										function callback, rather for the callback that the 'this.Update()' 
										will call, that is the text-creation function for the dynamicText update. */
				meshes: [], // all the dynamicTexts here. They will be Updated() by one timeInterval.
			};


			/**
			 * MAYBE BUG: Getting the 0 index timeInterval from timeIntervalsIdxBuffer assuming the bellow explanation.
			 *	If the same interval and update is going to be used, then we want the first timeInterval 
			 *	that was created which is the 0-th element of the this.timeIntervalsIdxBuffer.buffer[].
			 * What happens if the this.timeIntervalsIdxBuffer.buffer[] gets another timeInterval???
			 * How we distinguish which index we have to remove???
			 */
			const interval = TimeIntervalsGetByIdx(this.timeIntervalsIdxBuffer.buffer[0]);
			const prevFuncs = interval.clbkParams.params.func;
			const prevFuncsParams = interval.clbkParams.params.func_params;
			const prevMeshBuffer = interval.clbkParams.params.meshes;

			let i = 0;

			for (i = 0; i < prevFuncs.length; i++) {

				// Copy all previous callback functions found in the timeInterval to pass them to the new timeInterval.
				params.func[i] = prevFuncs[i];

				// Copy previous callback's_params.
				if (prevFuncsParams) params.func_params[i] = prevFuncsParams[i];
				else params.func_params[i] = null;

				// Copy previous meshes.
				params.meshes[i] = prevMeshBuffer[i];
			}

			params.func[i] = func;
			params.func_params[i] = func_params;
			params.meshes[i] = this.children.buffer[this.children.boundary - 1];

			/**
			 * Substitute interval_time_value or leave the same??
			 * Use initial interval time if user passes INT_NULL for 'msInterval' param, 
			 * else use the new interval time.
			 */
			if (msInterval === INT_NULL) msInterval = interval.interval;

			/** Destroy old timeInterval and create a new one with all the previous meshes and their callbacks and callback_params */
			TimeIntervalsDestroyByIdx(interval.idx);
			const tIdx = TimeIntervalsCreate(msInterval, name, TIME_INTERVAL_REPEAT_ALWAYS, this.Update, params);
			this.timeIntervalsIdxBuffer[0] = tIdx;
		}
	}

	/*******************************************************************************************************************************************************/
	// 
	CreateNewText(dynamic_text, fontSize, text_col2, pad = this.pad, bold = this.bold) {

		/** DEBUG ERROR*/ if (!Array.isArray(pad)) console.error('Pad is not of type array');
		this.pad = pad;

		let pos = [0, 0, 0];
		// Get the last child mesh (suppose to be dynamicText).
		if (this.children.buffer !== null) {

			const lastChild = this.children.buffer[this.children.boundary - 1];
			ERROR_NULL(lastChild, ' @ Widget_Dynamic_Text_Mesh.CreateNewText(). WidgetText.js');

			// console.log(lastChild.geom.pos)
			// Translate to right after the previous dynamicText.
			pos = [0, 0, 0];
			CopyArr3(pos, lastChild.geom.pos); // Copy the dynamic's text mesh pos
			const prevXdim = ((lastChild.geom.dim[0] * 2 * lastChild.mat.text.length) - lastChild.geom.dim[0]);
			pos[0] += prevXdim + this.geom.dim[0] + pad[0];
		}
		else {

			CopyArr3(pos, this.geom.pos); // Copy the dynamic's text mesh pos
			pos[0] += this.geom.CalcTextWidth()
		}

		const dynamicText = new Widget_Text(dynamic_text, pos, fontSize, text_col2, bold);
		dynamicText.type = MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC;

		// Add the new dynamicText as a child of 'this'.
		const idx = this.AddChild(dynamicText);
		dynamicText.SetName(idx, ' Dynamic Text ' + this.mat.text.slice(0, 7));

		this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | dynamicText.geom.type | dynamicText.mat.type;

		return idx;
	}

	Update(params) { // TODO!!!: Runs on every timeInterval. Make as efficient as possible

		if (!Array.isArray(params.params.meshes)) alert('Array must be passed as param.meshes to TimeInterval instantiation.')

		const meshes = params.params.meshes;
		const mesheslen = meshes.length


		for (let i = 0; i < mesheslen; i++) {

			let val = 0;
			if (params.params.func[i]) {

				if (params.params.func_params[i])
					val = params.params.func[i](params.params.func_params[i]); // Callback with parameters

				else val = params.params.func[i](); // Callback with no parameters
			}
			else if (params.params.func_params[i]) {
				val = params.params.func_params[i].delta_avg; // No callback, just a value
			}

			const text = `${val}`;
			const geom = meshes[i].geom;
			const gfx = meshes[i].gfx;
			const mat = meshes[i].mat;

			let gfxInfoCopy = new GfxInfoMesh(gfx);

			const textLen = text.length;
			const len = geom.num_faces > textLen ? geom.num_faces :
				(textLen > geom.num_faces ? geom.num_faces : textLen);

			// Update text faces
			for (let j = 0; j < len; j++) {

				let uvs = [0, 0, 0, 0];
				if (text[j] !== undefined) {
					uvs = FontGetUvCoords(mat.uvIdx, text[j]);
				}
				GlSetTex(gfxInfoCopy, uvs);
				gfxInfoCopy.vb.start += gfxInfoCopy.vb.count
			}
		}
	}

	// SEE ### OnMove Events Implementation Logic
	OnMove(params) {

		// The 'OnMove' function is called by the timeInterval.
		// The timeInterval has been set by an 'OnClick' event.
		const mesh = params.params;
		const mouse_pos = MouseGetPosDif();

		// Move 'this' text
		mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, mesh.gfx);
		// Move children text
		for (let i = 0; i < this.children.boundary; i++) {

			const child = this.children.buffer[i];
			if (child) child.MoveXY(mouse_pos.x, -mouse_pos.y, child.gfx);
		}
	}

	/*******************************************************************************************************************************************************/
	// Transformations
	Move(x, y) {

		// Move 'this' text
		this.geom.MoveXY(x, y, this.gfx);

		// Move children text
		for (let i = 0; i < this.children.boundary; i++) {

			const child = this.children.buffer[i];
			if (child) child.geom.MoveXY(x, y, child.gfx);
		}

	}
}

