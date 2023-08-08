"use strict";

import { GlSetTex } from "../../../Graphics/Buffers/GlBufferOps.js";
import { GlGetContext } from "../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh, GlGetProgram } from "../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { TimeIntervalsCreate } from "../../Timers/TimeIntervals.js";
import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { Geometry2D_Text } from "../Geometry/Geometry2DText.js";
import { FontMaterial, Material } from "../Material/Material.js";
import { MESH_ENABLE, Mesh, Text_Mesh } from "../Mesh.js";



function CalculateArea(text, _dim, pos, pad) {

    const textLen = text.length;
    const dim = [_dim[0] * textLen, _dim[1]];

    const areaWpos = [pos[0], pos[1], pos[2]];
    areaWpos[0] -= _dim[0] + pad; // Subtract half face
    areaWpos[0] += pad; // Subtract half face

    dim[0] += pad * 2; // Padd height
    dim[1] += pad * 2; // Padd width

    areaWpos[0] += dim[0]; // center the area arround text

    return {
        dim: dim,
        pos: areaWpos,
    };
}


/**
 * The difference with plain text is that a label draws the text inside a rect mesh
 */
export class Widget_Label_Text extends Mesh {

    type = 0;
    pad = 0;

    constructor(text, pos, fontSize, scale = [1, 1], pad = 0, bold = .4) {

        const sdfouter = CalculateSdfOuterFromDim(fontSize);
        const textmat = new FontMaterial(WHITE, FONTS.SDF_CONSOLAS_LARGE, text, [bold, sdfouter])
        const textgeom = new Geometry2D_Text(pos, fontSize, scale, text, FONTS.SDF_CONSOLAS_LARGE);
        pos[2] -= 1; // Set z-axis, render text in front of area

        const areaMetrics = CalculateArea(text, textgeom.dim, pos, pad)
        const areageom = new Geometry2D(areaMetrics.pos, areaMetrics.dim, scale, text);
        const areamat = new Material(BLUE_10_160_220)

        super(areageom, areamat);

        textgeom.pos[0] += pad * 2; // In essence we set as the left (start of text label) the label area and not the left of text.

        this.Enable(MESH_ENABLE.ATTR_STYLE);
        this.SetStyle(6, 8, 3);

        const textMesh = new Text_Mesh(textgeom, textmat);
        this.AddChild(textMesh);

        this.type |= MESH_TYPES.TEXT_LABEL;
        this.type |= textgeom.type;
        this.type |= textmat.type;
        this.type |= areageom.type;
        this.type |= areamat.type;

        console.debug('WidgetLabelText type:', GetMeshType(this.type))

        this.pad = pad;
    }


    // ChangeText(newText) {
    //     // this.name = newText;

    //     // const newlen = newText.length;
    //     // const totallen = this.text.len;
    //     // const spaceCharUvs = FontGetUvCoords(' ');

    //     // for (let i = 0; i < totallen; i++) {
    //     //     if (i < newlen) {
    //     //         const uvs = FontGetUvCoords(newText[i]);
    //     //         GlSetTex(this.text.letters[i].gfxInfo, uvs);
    //     //         this.text.letters[i].tex = uvs;
    //     //     }
    //     //     else { // Set remaining characters to empty(space char)
    //     //         GlSetTex(this.text.letters[i].gfxInfo, spaceCharUvs);
    //     //         this.text.letters[i].tex = spaceCharUvs;
    //     //     }
    //     // }
    // }

    //////////////////////////////////////////////////////////////

    AddToGraphicsBuffer(sceneIdx) {

        const gfx = []
        for (let i = 0; i < this.children.count; i++) {
            gfx[i + 1] = this.children.buffer[i].AddToGraphicsBuffer(sceneIdx);
        }
        gfx[0] = super.AddToGraphicsBuffer(sceneIdx);

        return gfx;

    }

    Listener_listen_mouse_hover() {
        this.geom.Listener_listen_mouse_hover();
    }

}


export class Widget_Label_Dynamic_Text extends Widget_Label_Text {

	/** Set the max number of characters for the dynamic text, 
	 * by passing any text as 'maxDynamicTextChars' of length= dynamic text number of characters*/
	constructor(text, maxDynamicTextChars, pos, fontSize, scale, color1, color2, pad, bold) {

		super(text, pos, fontSize, scale, pad, bold);

		// Translate the dynamic text by the width of the constant text's width
		pos[0] += (fontSize * 2 * text.length) + fontSize + pad;
		const dynamicText = new Widget_Label_Text(maxDynamicTextChars, pos, fontSize, scale, pad, bold);
		
        this.AddChild(dynamicText)

		this.type |= MESH_TYPES.WIDGET_TEXT_DYNAMIC;
		this.type |= dynamicText.geom.type;
		this.type |= dynamicText.mat.type;
	}

	AddToGraphicsBuffer(sceneIdx) {

		/** Add the constant text */
		super.AddToGraphicsBuffer(sceneIdx);

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
	SetDynamicText(msInterval, Func, name) {

		// Set an interval timer to update the fps uxi
		const params = {
			Func: Func,
			mesh: this.children.buffer[1].children.buffer[0],
		};
		const tIdx = TimeIntervalsCreate(msInterval, name, TIME_INTERVAL_REPEAT_ALWAYS, this.Update, params);
        this.timeIntervalsIdxBuffer.Add(tIdx)
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
