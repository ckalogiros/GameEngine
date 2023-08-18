"use strict";

import { GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GlGetContext } from "../../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh, GlGetProgram } from "../../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../../Helpers/Helpers.js";
import { FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { TimeIntervalsCreate } from "../../../Timers/TimeIntervals.js";
import { Geometry2D } from "../../Geometry/Base/Geometry.js";
import { Geometry2D_Text } from "../../Geometry/Geometry2DText.js";
import { FontMaterial, Material } from "../../Material/Base/Material.js";
import { MESH_ENABLE, Mesh, Recursive_gfx_operations, Text_Mesh } from "../Base/Mesh.js";



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
export class Widget_Label_Text_Mesh extends Mesh {

    type = 0;
    pad = 0;

    constructor(text, pos, fontSize, col = GREY3, textCol = WHITE, scale = [1, 1], pad = 0, bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {

        const sdfouter = CalculateSdfOuterFromDim(fontSize);
		if(sdfouter + bold > 1) bold =  1-sdfouter;
		// console.log(sdfouter)
        const textmat = new FontMaterial(textCol, font, text, [bold, sdfouter])
        const textgeom = new Geometry2D_Text(pos, fontSize, scale, text, font);
        pos[2] -= 1; // Set z-axis, render text in front of area

        const areaMetrics = CalculateArea(text, textgeom.dim, pos, pad)
        const areageom = new Geometry2D(areaMetrics.pos, areaMetrics.dim, scale);
        const areamat = new Material(col)

        super(areageom, areamat);

        textgeom.pos[0] += pad * 2; // In essence we set as the left (start of text label) the label area and not the left of text.

        this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        this.SetStyle(style[0], style[1], style[2]);
        
        const textMesh = new Text_Mesh(textgeom, textmat);
        textMesh.SetName();
        
        this.type |= MESH_TYPES_DBG.WIDGET_TEXT_LABEL | textgeom.type | textmat.type | areageom.type | areamat.type;
        this.SetName();
        this.pad = pad;
        this.AddChild(textMesh);

        
        console.debug('WidgetLabelText type:', GetMeshNameFromType(this.type))

    }

    //////////////////////////////////////////////////////////////

    AddToGraphicsBuffer(sceneIdx, useSpecificVertexBuffer = GL_VB.ANY, vertexBufferIdx = NO_SPECIFIC_GL_BUFFER) {

        let vbidx1 = null, vbidx2 = null;
        let vbUse1 = null, vbUse2 = null;
        if(Array.isArray(vertexBufferIdx)){
            vbidx1 = vertexBufferIdx[0];
            vbidx2 = vertexBufferIdx[1];
            vbUse1  = useSpecificVertexBuffer[0];
            vbUse2  = useSpecificVertexBuffer[1];
        }
        else  {
            vbidx1 = useSpecificVertexBuffer;
            vbidx2 = useSpecificVertexBuffer;
            vbUse1 = useSpecificVertexBuffer;
            vbUse2 = useSpecificVertexBuffer;
        }

        const gfx = []
        for (let i = 0; i < this.children.count; i++) {
            gfx[i + 1] = this.children.buffer[i].AddToGraphicsBuffer(sceneIdx, vbUse2, vbidx2);
        }
        gfx[0] = super.AddToGraphicsBuffer(sceneIdx, vbUse1, vbidx1);

        return gfx;

    }

    Listener_listen_mouse_hover() {
        this.geom.Listener_listen_mouse_hover();
    }

    GetOptions(){
        return 'Widget_Label_Text_Mesh Options'
    }

    BringToFront(z){

        this.geom.SetZindex(z, this.gfx)

        if (this.children.count) {
            const params = {
                z: z+1, // +1: more close than the label area.
                numFaces: this.children.buffer[0].geom.numChars, // A Label_Text class guarantees the first child (buffer[0]) to be the first character.
            }
            Recursive_gfx_operations(this, Bring_to_front, params)
        }
    }
    SetDefaultZindex(){

        this.geom.SetZindex(this.geom.zIndex, this.gfx)

        if (this.children.count) {
            const params = {
                numFaces: this.children.buffer[0].geom.numChars, // A Label_Text class guarantees the first child (buffer[0]) to be the first character.
            }
            Recursive_gfx_operations(this, Set_default_zindex, params)
        }
    }

}


export class Widget_Label_Dynamic_Text extends Widget_Label_Text_Mesh {

	/** Set the max number of characters for the dynamic text, 
	 * by passing any text as 'maxDynamicTextChars' of length= dynamic text number of characters*/
	constructor(text, maxDynamicTextChars, pos, fontSize, col, textcol, scale, pad, bold) {

		super(text, pos, fontSize, col, textcol, scale, pad, bold);
        
		// Translate the dynamic text by the width of the constant text's width
		pos[0] += (fontSize * 2 * text.length) + fontSize + pad;
		const dynamicText = new Widget_Label_Text_Mesh(maxDynamicTextChars, pos, fontSize, col, textcol, scale, pad, bold);
        dynamicText.SetName();
		
        this.AddChild(dynamicText)
        
		this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | dynamicText.geom.type | dynamicText.mat.type;
        this.SetName();
	}

	AddToGraphicsBuffer(sceneIdx) {

		/** Add the constant text */
		super.AddToGraphicsBuffer(sceneIdx);

		/** Add the dynamic text to the graphics buffer */
		const dynamicText = this.children.buffer[0];
		dynamicText.gfx = GlGetContext(dynamicText.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
		const prog = GlGetProgram(dynamicText.gfx.prog.idx);
		if (dynamicText.sid.unif & SID.UNIF.BUFFER_RES) {
			const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
			prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
			prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
		}

		dynamicText.geom.AddToGraphicsBuffer(dynamicText.sid, dynamicText.gfx, dynamicText.name);
		dynamicText.mat.AddToGraphicsBuffer(dynamicText.sid, dynamicText.gfx);

		return [
			this.gfx,
			dynamicText.gfx,
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


/**
 * This is just to have a class named specific for menus text, like the popup menu,
 * so that we only use this kind of class for all menus with text.
 */
export class Widget_Label_Text_Mesh_Menu_Options extends Widget_Label_Text_Mesh{
    constructor(text, pos, fontSize, col, textCol, scale, pad, bold, font, style) {
        super(text, pos, fontSize, col, textCol, scale, pad, bold, font, style) 
        this.type |= MESH_TYPES_DBG.WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS;
    }

}



function Bring_to_front(mesh, params) {

    mesh.geom.SetZindex(params.z, mesh.gfx, params.numFaces)
}
function Set_default_zindex(mesh, params) {

    const defZ = mesh.geom.zIndex;
    mesh.geom.SetZindex(defZ, mesh.gfx, params.numFaces)
}