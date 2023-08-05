"use strict";

import { GlSetTex } from "../../../Graphics/Buffers/GlBufferOps.js";
import { GlGetContext } from "../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh, GlGetProgram } from "../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { TimeIntervalsCreate } from "../../Timer/Time.js";
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
export class Widget_Text_Dynamic extends Widget_Text {

	/** Set the max number of characters for the dynamic text, 
	 * by passing any text as 'maxDynamicTextChars' of length= dynamic text number of characters*/
	constructor(text, maxDynamicTextChars, pos, fontSize, scale, color1, color2, bold) {

		super(text, pos, fontSize, scale, color1, bold);

		// Translate the dynamic text by the width of the constant text's width
		pos[0] += (fontSize * 2 * text.length) + fontSize;
		const dynamicText = new Widget_Text(maxDynamicTextChars, pos, fontSize, scale, color2, bold);
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

	/**
	  * 
	  * @param {integer} msInterval The time interval in ms the dynamic text will be updated
	  * @param {callbackfunction} Func The function to call upon time interval
	  */
	SetDynamicText(msInterval, Func) {

		// Set an interval timer to update the fps uxi
		const params = {
			Func: Func,
			mesh: this.children.buffer[0],
		};
		TimeIntervalsCreate(msInterval, 'Ui-fpsUpdate', TIME_INTERVAL_REPEAT_ALWAYS, this.Update, params);

	}

	Update(params) { // TODO: Runs every frame. Make more efficient

		const t = params.params.Func();
		if (!t || t === undefined) return;

		const textFpsAvg = `${t}`;
		const geom = params.params.mesh.geom;
		const gfx = params.params.mesh.gfx;
		const mat = params.params.mesh.mat;

		let gfxInfo = new GfxInfoMesh(gfx);

		const textLen = textFpsAvg.length;
		const len = geom.numChars > textLen ? geom.numChars : (textLen > geom.numChars ? geom.numChars : textLen);

		// const len = textLen;
		for (let i = 0; i < len; i++) {

			/** Update fps average */
			let uvs = [0, 0, 0, 0];
			if (textFpsAvg[i] !== undefined) {
				uvs = FontGetUvCoords(mat.uvIdx, textFpsAvg[i]);
			}
			GlSetTex(gfxInfo, uvs);
			gfxInfo.vb.start += gfxInfo.vb.count
		}
	}
}


