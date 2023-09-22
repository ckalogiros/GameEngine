"use strict";

import { GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { Gl_remove_geometry, Gl_shift_right_geometry } from "../../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh } from "../../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../../Helpers/Helpers.js";
import { CopyArr2, CopyArr3 } from "../../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../../Collisions.js";
import { MouseGetPos, MouseGetPosDif } from "../../../Controls/Input/Mouse.js";
import { FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { Scenes_update_all_gfx_starts2 } from "../../../Scenes.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx, TimeIntervalsGetByIdx } from "../../../Timers/TimeIntervals.js";
import { I_Text } from "../Rect.js";

/**
 * 
 * TODO: When we have to implement that the user decides for the font type (sdf...etc)
 * then the CalculateSdfOuterFromDim must:
 * 1. live in an if statment (if(fontType is sdf))
 * 2. move the function to the parent class instead of call it from all children classes of Text_Mesh
 */
export class Widget_Text extends I_Text {

	pad = [0, 0];

	constructor(text, pos, fontSize = 5,  color = WHITE, bold = 4, font, scale) {

		const sdfouter = CalculateSdfOuterFromDim(fontSize);
		if (sdfouter + bold > 1) bold = 1 - sdfouter;

		super(text, pos, fontSize, scale, color)
		this.type |= MESH_TYPES_DBG.WIDGET_TEXT | this.type;

		this.SetName('Text ' + text.slice(0, 7))

	}

	GenGfxCtx(FLAGS, gfxidx) {

		const gfx = super.GenGfxCtx(FLAGS, gfxidx);
		return gfx;
	}

	AddToGfx() {

		super.AddToGfx()
	}

	Align_pre(target_mesh, flags, pad=[0,0]) { // Align pre-added to the vertexBuffers

		const pos = [0, 0];
		const dim = this.geom.dim;
		CopyArr2(pos, this.geom.pos);
		let ypos = pos[1] + dim[1] * 2;

		// pos[0] -= dim[0] * this.mat.num_faces / 2 - this.pad[0] / 2;
		// this.geom.pos[0] = pos[0]

		if (flags & ALIGN.VERTICAL) {

			for (let i = 0; i < this.children.count; i++) {

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
			const num_faces = (this.geom.num_faces-1 > 1) ? this.geom.num_faces-1 : 1;
			pos[0] = (target_mesh.geom.pos[0] + target_mesh.geom.dim[0]) - (this.geom.dim[0]*2*num_faces) - pad[0];

			CopyArr2(this.geom.pos, pos);

		}


	}

	OnClick(params) {

		const mesh = params.source_params;
		const point = MouseGetPos();
		const m = mesh.geom;

		console.log(point, m.pos, m.dim)

		if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 8])) {

			STATE.mesh.SetClicked(params.source_params);

			if (mesh.timeIntervalsIdxBuffer.count <= 0) {

				/**
				 * Create move event.
				 * The move event runs only when the mesh is GRABED.
				 * That means that the timeInterval is created and destroyed upon 
				 * onClickDown and onClickUp respectively.
				 */
				const idx = TimeIntervalsCreate(10, 'Move Widget_Text', TIME_INTERVAL_REPEAT_ALWAYS, mesh.OnMove, mesh);
				mesh.timeIntervalsIdxBuffer.Add(idx);

				if (mesh.StateCheck(MESH_STATE.IS_GRABABLE)) {

					STATE.mesh.SetGrabed(mesh);
					mesh.StateEnable(MESH_STATE.IN_GRAB);
				}

			}
			return true;
		}
		return false;
	}

	OnMove(_params) {

		/**
		 * The function is called by the timeInterval.
		 * The timeInterval has been set by the 'OnClick' event.
		 */

		const mesh = _params.params;

		// Destroy the time interval calling this function if the mesh is not grabed.
		if (mesh.StateCheck(MESH_STATE.IN_GRAB) === 0) {

			const intervalIdx = mesh.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
			TimeIntervalsDestroyByIdx(intervalIdx);
			mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

			return;
		}

		// Move the mesh
		console.log('MOVING Widget Text')
		const mouse_pos = MouseGetPosDif();
		mesh.MoveRecursive(mouse_pos.x, -mouse_pos.y);

	}

	UpdateText(new_text){

		const textMesh = this;
		if ((textMesh.type & MESH_TYPES_DBG.TEXT_MESH) === 0) return; // Guard against none text meshes

		const textLen = new_text.length;

		if(textMesh.geom.num_faces < textLen){

			const dif_num_faces = textLen - textMesh.geom.num_faces;
			
			// If the text to be update is larger than the text allready in the vertex buffer, 
			// shift all next elements of the buffer to the start of the curent text, 
			// and re-add the text mesh at the end of the vertex buffer.
			// Need to update all ther gfx.starts of all the shifted meshes.
			// const ret = Gl_remove_geometry(this.gfx, this.geom.num_faces)
			const ret = Gl_shift_right_geometry(textMesh.gfx, textMesh.geom.num_faces, dif_num_faces)
			Scenes_update_all_gfx_starts2(textMesh.sceneIdx, textMesh.gfx.prog.idx, textMesh.gfx.vb.idx, ret);

			textMesh.mat.text = new_text; 
			textMesh.geom.num_faces = textLen;
			textMesh.mat.num_faces = textLen;
			
			textMesh.geom.AddToGraphicsBuffer(textMesh.sid, textMesh.gfx, textMesh.name);
			textMesh.mat.AddToGraphicsBuffer(textMesh.sid, textMesh.gfx);
			return;
		}

		/** CAUTION!: Be sure to initialize the 'textMesh.mat.num_faces' 
		with the longest text so the vertexBuffers have enough 
		space to store the longest text */

		let gfxInfo = new GfxInfoMesh(textMesh.gfx);


		const len = textMesh.geom.num_faces > textLen ? textMesh.geom.num_faces : (textLen > textMesh.geom.num_faces ? textMesh.geom.num_faces : textLen);

		// const len = textLen;
		for (let i = 0; i < len; i++) {

			 /** Update fps average */
			 let uvs = [0, 0, 0, 0];
			 if (new_text[i] !== undefined) {
				  uvs = FontGetUvCoords(textMesh.mat.uvIdx, new_text[i]);
			 }
			 GlSetTex(gfxInfo, uvs);
			 gfxInfo.vb.start += gfxInfo.vb.count
		}
	}

	Reposition_post(dif_pos){

		this.MoveXYZ(dif_pos)
		for(let i=0; i<this.children.count; i++){

			const child = this.children.buffer[i];
			child.MoveXYZ(dif_pos)
		}
   }

}

let DYN_TEXT_UPDATE_INTERVAL_IDX = INT_NULL;

export class Widget_Dynamic_Text_Mesh_Only extends Widget_Text {


	/** The 'maxDynamicTextChars' sets the max number of characters for the dynamic text.
	 * If the text changes to a lesser number of chars, the update function just adds empty spaces*/
	constructor(maxDynamicTextChars, pos, fontSize, scale, color1, bold) {

		super(maxDynamicTextChars, pos, fontSize, color1, bold, scale);

		this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | this.geom.type | this.mat.type;

		this.SetName('Dynamic Text ' + this.mat.text.slice(0, 7));


	}

	GenGfxCtx(FLAGS, gfxidx) {

		const gfx = super.GenGfxCtx(FLAGS, gfxidx);
		return gfx;
	}

	AddToGfx() {

		super.AddToGfx()
	}

	CreateNewText(maxDynamicTextChars, fontSize, color2, pad=this.pad, bold=this.bold) {

		 /** DEBUG */ if (!Array.isArray(pad)) console.error('Pad is not of type array');
		this.pad = pad;

		let pos = [0, 0, 0];
		// Get the last child mesh (suppose to be dynamicText).
		if (this.children.buffer !== null) {

			const lastChild = this.children.buffer[this.children.count - 1];
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

		const dynamicText = new Widget_Text(maxDynamicTextChars, pos, fontSize, color2, bold);
		dynamicText.type = MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC;
		
		// Add the new dynamicText as a child of 'this'.
		const idx = this.AddChild(dynamicText);
		dynamicText.SetName(idx, ' Dynamic Text ' + this.mat.text.slice(0, 7));

		// console.log('dynamicText:', dynamicText.mat.text,  dynamicText.geom.pos)

		this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | dynamicText.geom.type | dynamicText.mat.type;

		return idx;
	}

	/**
	  * ##SetDynamicText
	  * @param {integer} msInterval The time interval in ms the dynamic text will be updated
	  * @param {callbackfunction} func The function to call upon time interval
	  * 
	  * This function sets up the update of the dynamic text part of this class.
	  * The function sets up a timeInterval that will call back the this.Update() method.
	  * The Update method must have 'params' parameter and the params must have: 
	  * 	1. A 'func' field: that is the callback (set by the caller to this.SetDynamicText() call).
	  * 		The 'func' is a function responsible for returning a string, that will be used to
	  * 		update the curent dynamicText.
	  * 		The 'func' field is an array, even if there is only one callback (for one dynamicText).
	  * 		This is because we may create additional dynamicTexts that will need their own 
	  * 		text creation callback.
	  * 	2. A 'meshes' field: that is an array of 'dynamicText' meshes. We prefer an array, 
	  * 		in case we need to pass more than one 'dynamicText' meshes to the update function
	  * 		for execution. 
	  * In the update method we loop through all characters of the new text and update the 
	  * graphics buffers.
	  */
	SetDynamicText(msInterval, func, name, idx = INT_NULL, func_params = null, flag) {


		if (idx !== INT_NULL || this.children.count <= 0 || flag) {
			/**
			 * The this.children.count takes a snapshot of the children count upon this function call.
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
			if (flag) meshes.push(this.children.buffer[0]); // At first call we deal with the first child mesh at index 0
			else if (idx === INT_NULL) meshes.push(this); // At first call we deal with the first child mesh at index 0
			else meshes.push(this.children.buffer[idx]);
			params.meshes = meshes;

			const tIdx = TimeIntervalsCreate(msInterval, name, TIME_INTERVAL_REPEAT_ALWAYS, this.Update, params);
			this.timeIntervalsIdxBuffer.Add(tIdx);
		}
		else { // Update dynamicText via one timeInterval Update().

			// The 'new' params to be passed to the new timeInterval.
			const params = {
				func: [], // All timeInterval's callbacks here
				func_params: [], /* These are the parameters NOT for the timeInterval and the 'this.Update()' 
										function callback, rather for the callback the 'this.Update()' 
										will call, to create the text for the dynamicText update. */
				meshes: [], // all the dynamicTexts here. They wiil be Updated() by one timeInterval.
			};


			/**
			 * MAYBE BUG: Getting the 0 index timeInterval from timeIntervalsIdxBuffer assuming the bellow explanation.
			 *	If the same interval and update is going to be used, then we want the first timeInterval 
			 *	that was created which is the 0-th element of the this.timeIntervalsIdxBuffer.buffer[].
			 * What happens if the this.timeIntervalsIdxBuffer.buffer[] gets another timeInterval???
			 * How we distinguish which index we have to remove???
			 */
			const interval = TimeIntervalsGetByIdx(this.timeIntervalsIdxBuffer.buffer[0]);
			const oldFuncs = interval.clbkParams.params.func;
			const oldFuncsParams = interval.clbkParams.params.func_params;
			const oldMeshBuffer = interval.clbkParams.params.meshes;

			let i = 0;

			// Copy all callback functions found in the timeInterval to pass them to the new timeInterval.
			for (i = 0; i < oldFuncs.length; i++) {

				// Copy all callback functions found in the timeInterval to pass them to the new timeInterval.
				params.func[i] = oldFuncs[i];

				// Copy all callback's_params.
				if (oldFuncsParams) params.func_params[i] = oldFuncsParams[i];
				else params.func_params[i] = null;

				// Copy all meshes.
				params.meshes[i] = oldMeshBuffer[i];
			}

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

	Update(params) { // TODO!!!: Runs on every timeInterval. Make as efficient as possible

		if (!Array.isArray(params.params.meshes)) alert('Array must be passed as param.meshes to TimeInterval instantiation.')

		const meshes = params.params.meshes;
		const mesheslen = meshes.length

		
		for (let i = 0; i < mesheslen; i++) {
			
			let val = 0;
			if(params.params.func[i]){

				if(params.params.func_params[i])
					val = params.params.func[i](params.params.func_params[i]); // Callback with parameters
					
				else val = params.params.func[i](); // Callback with no parameters
			}
			else if(params.params.func_params[i]){
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


	SetColorRGB(col) { 

		let num_faces = this.geom.num_faces;
		for(let i=0; i<this.children.count; i++){
			num_faces += this.children.buffer[i].geom.num_faces;
		}
		this.mat.SetColorRGB(col, this.gfx, num_faces) 
  }
}

/**
 * A widget of rendering static text 
 * in combination with dynamic text.
 */
export class Widget_Dynamic_Text_Mesh extends Widget_Dynamic_Text_Mesh_Only {

	/** Set the max number of characters for the dynamic text, 
	 * by passing any text as 'maxDynamicTextChars' of length= dynamic text number of characters*/
	constructor(text, maxDynamicTextChars, pos, fontSize, scale, color1, color2, bold) {

		super(text, pos, fontSize, scale, color1, bold);

		// Translate the dynamic text by the width of the constant text's width
		pos[0] += this.geom.CalcTextWidth();
		const dynamicText = new Widget_Text(maxDynamicTextChars, pos, fontSize, color2, bold);

		this.AddChild(dynamicText)

		this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | dynamicText.geom.type | dynamicText.mat.type;

	}

	GenGfxCtx(FLAGS, gfxidx) {

		super.GenGfxCtx(FLAGS, gfxidx);
		return this.gfx;
	}

	AddToGfx() {

		super.AddToGfx();
	}

	/**
	  * @param {integer} msInterval The time interval in ms the dynamic text will be updated
	  * @param {callbackfunction} func The function to call upon time interval
	  * See explanation at ##SetDynamicText
	  */
	SetDynamicText(name, msInterval, func, func_params = null, idx = INT_NULL) {

		if (idx !== INT_NULL || this.children.count <= 1) {
			/**
			 * The this.children.count takes a snapshot of the children count upon this function call.
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
			// const interval = TimeIntervalsGetByIdx(this.timeIntervalsIdxBuffer.buffer[DYN_TEXT_UPDATE_INTERVAL_IDX]);
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
			params.meshes[i] = this.children.buffer[this.children.count - 1];

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
}



