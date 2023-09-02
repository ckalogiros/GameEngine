"use strict";

import { GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GfxInfoMesh, GlGetProgram } from "../../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../../Helpers/Helpers.js";
import { CopyArr2 } from "../../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../../Collisions.js";
import { MouseGetPos } from "../../../Controls/Input/Mouse.js";
import { FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { Gfx_generate_context } from "../../../Interface/GfxContext.js";
import { TimeIntervalsCreate } from "../../../Timers/TimeIntervals.js";
import { Geometry2D_Text } from "../../Geometry/Geometry2DText.js";
import { FontMaterial } from "../../Material/Base/Material.js";
import { MESH_ENABLE, Text_Mesh } from "../Base/Mesh.js";
import { I_Text, Rect } from "../Rect.js";



function CalculateAreaNoPadding(text, _dim, pos, pad=[0,0]) {

    const textLen = text.length;
    const dim = [_dim[0] * textLen, _dim[1]];

    const areaWpos = [pos[0], pos[1], pos[2]];
    areaWpos[0] -= _dim[0]; // Subtract half face

    dim[0] -= pad[0] * 2; // Padd height
    dim[1] -= pad[1] * 2; // Padd width

    areaWpos[0] += dim[0]; // center the area arround text

    return {
        dim: dim,
        pos: areaWpos,
    };
}

function CalculateArea(text, _dim, pos, pad = [0, 0]) {

    const textLen = text.length;
    const dim = [_dim[0] * textLen, _dim[1]];

    const areaWpos = [pos[0], pos[1], pos[2]];
    areaWpos[0] -= _dim[0] + pad[0]; // Subtract half face
    areaWpos[0] += pad[0]; // Subtract half face

    dim[0] += pad[0] * 2; // Padd height
    dim[1] += pad[1] * 2; // Padd width

    areaWpos[0] += dim[0]; // center the area arround text

    return {
        dim: dim,
        pos: areaWpos,
    };
}


/**
 * The difference with plain text is that a label draws the text inside a rect mesh
 */
export class Widget_Label extends Rect {

    pad = [0, 0];

    constructor(text, pos=[200, 300], fontSize=8, col = BLACK, textCol = WHITE, scale = [1, 1], pad = [10, 5], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [0, 0, 0]) {

        const sdfouter = CalculateSdfOuterFromDim(fontSize);
        if (sdfouter + bold > 1) bold = 1 - sdfouter;
        
        const textMesh = new I_Text(text, pos, fontSize)

        pos[0] -= pad[0] * 2; // In essence we set as the left (start of text label) the label area and not the left of text.
        pos[2] -= 1; // In essence we set as the left (start of text label) the label area and not the left of text.


        const areaMetrics = CalculateArea(text, textMesh.geom.dim, pos, pad)

        super(areaMetrics.pos, areaMetrics.dim, col);

        
        this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        this.SetStyle(style);
        
        textMesh.SetName();
        textMesh.SetSceneIdx(this.sceneIdx);

        this.type |= MESH_TYPES_DBG.WIDGET_TEXT_LABEL | textMesh.type | this.geom.type | this.mat.type;
        this.SetName();
        this.pad = pad;
        this.AddChild(textMesh);
    }

    UpdateText(text) {

        const textMesh = this.children.buffer[0];
        textMesh.mat.text = text; /** CAUTION!: Be sure to initialize the 'textMesh.mat.num_faces' 
                                        with the longest text so the vertexBuffers have enough 
                                        space to store the longest text */

        if ((textMesh.type & MESH_TYPES_DBG.TEXT_MESH) === 0) return; // Guard against none text meshes

        const geom = textMesh.geom;
        const gfx = textMesh.gfx;
        const mat = textMesh.mat;

        let gfxInfo = new GfxInfoMesh(gfx);

        const textLen = text.length;
        const len = geom.num_faces > textLen ? geom.num_faces : (textLen > geom.num_faces ? geom.num_faces : textLen);

        // const len = textLen;
        for (let i = 0; i < len; i++) {

            /** Update fps average */
            let uvs = [0, 0, 0, 0];
            if (text[i] !== undefined) {
                uvs = FontGetUvCoords(mat.uvIdx, text[i]);
            }
            GlSetTex(gfxInfo, uvs);
            gfxInfo.vb.start += gfxInfo.vb.count
        }
    }

    UpdateChildrenPos(){

        for(let i=0; i<this.children.count; i++){

            const child = this.children.buffer[i];

            if(child){

                const areaMetrics = CalculateAreaNoPadding(child.mat.text, child.geom.dim, this.geom.pos, this.pad);
                areaMetrics.pos[0] -= this.geom.dim[0];
                CopyArr2(child.geom.pos, areaMetrics.pos);
            }
         }
    }

    UpdatePosXYZ(){

        super.UpdatePosXYZ();
        this.children.buffer[0].UpdatePosXYZ()
    }

    //////////////////////////////////////////////////////////////

    GenGfxCtx(FLAGS, gfxidx) {

        const gfx = super.GenGfxCtx(FLAGS, gfxidx);
        return gfx;
    }
	
	AddToGfx(){
        
        super.AddToGfx()
	}

	Align(flags) { // Align pre-added to the vertexBuffers

		const pos = [0, 0];
		const dim = this.geom.dim;
		CopyArr2(pos, this.geom.pos);
		let ypos = pos[1] + dim[1] * 2;

		pos[0] -= dim[0] * this.mat.num_faces / 2 - this.pad[0] / 2;
		this.geom.pos[0] = pos[0]

		if (flags & ALIGN.VERTICAL) {

			for (let i = 0; i < this.children.count; i++) {

				const child = this.children.buffer[i];
				pos[1] = ypos;

				child.geom.Reposition_pre(pos);
				ypos += child.geom.dim[1] * 2;
			}

		}
	}

    Align_pre(target_mesh, flags) { // Align pre-added to the vertexBuffers

        const pos1 = target_mesh.geom.pos;
        const dim1 = target_mesh.geom.dim;
        const pos2 = this.geom.pos;
        const dim2 = this.geom.dim;

        if (flags & (ALIGN.VERT_CENTER | ALIGN.RIGHT)) {

            const pos = [0, 0];
            CopyArr2(pos, pos2);

            // Vertical allignment
            pos[1] = pos1[1];

            // Horizontal allignment
            pos[0] = pos1[0] + dim1[0] - dim2[0];

            CopyArr2(pos2, pos);

            const child = this.children.buffer[0]; // We know that there is a text childern at 0 index.
            child.geom.Reposition_pre(pos);

        }
    }

    Align_post(){ // Align and update gfx buffers

    }

}


export class Widget_Label_Dynamic_Text extends Widget_Label {

    /** Set the max number of characters for the dynamic text, 
     * by passing any text as 'maxDynamicTextChars' of length= dynamic text number of characters*/
    constructor(text, maxDynamicTextChars, pos, fontSize=4, col, textcol, scale, pad=[10,10], bold) {

        super(text, pos, fontSize, col, textcol, scale, pad, bold);

        // Translate the dynamic text by the width of the constant text's width
        CopyArr2(pos, this.geom.pos)
        this.pad = [5,5]
        pos[0] += this.geom.dim[0] + this.pad[0]*2;
        
        const dynamicText = new Widget_Label(maxDynamicTextChars, pos, fontSize, YELLOW_240_220_10, textcol, scale, this.pad, bold);
        dynamicText.SetName();

        this.AddChild(dynamicText)

        this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | dynamicText.geom.type | dynamicText.mat.type;
        this.SetName();
    }

    GenGfxCtx(FLAGS, gfxidx) {

        const gfx = super.GenGfxCtx(FLAGS, gfxidx);
        return gfx;
    }
	
	AddToGfx(){
        
        super.AddToGfx()
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
        const len = geom.num_faces > textLen ? geom.num_faces : (textLen > geom.num_faces ? geom.num_faces : textLen);

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
export class Widget_Label_Text_Mesh_Menu_Options extends Widget_Label {

    constructor(text, pos, fontSize, col, textCol, scale, pad, bold, font, style) {

        super(text, pos, fontSize, col, textCol, scale, pad, bold, font, style)
        this.type |= MESH_TYPES_DBG.WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS;
    }

    GenGfxCtx(FLAGS, gfxidx) {

		const gfx = super.GenGfxCtx(FLAGS, gfxidx);
		return gfx;
	}

	AddToGfx() {

		super.AddToGfx()
	}

    SetPos(pos) {
        super.SetPos(pos)
    }


    OnClick(_params) {

        const mesh = _params.source_params;
        const point = MouseGetPos();
        const m = mesh.geom;

        // console.log('click')
        if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {

            console.log('Button Clicked! ', mesh.name)
            STATE.mesh.SetClicked(mesh);

            /**
             * For popup menu options and slider connections.
             * If the option is clicked, then we must call the slider connect function
             */
            if (_params.target_params) {

                const target_params = {

                    targetBindingFunctions: _params.target_params.targetBindingFunctions,
                    self_mesh: _params.target_params.clicked_mesh,
                    target_mesh: _params.target_params.target_mesh,
                    event_type: _params.event_type,
                    /*FOR DEBUG*/clicked_mesh: mesh,
                }
                const EventClbk = _params.target_params.EventClbk;
                console.log('OnClick callback IN. meshId ', mesh.id)
                EventClbk(target_params);
                console.log('OnClick callback OUT. meshId ', mesh.id)
            }
           
            return true;
        }
        
        return false;
    }
    

}



// function Bring_to_front(mesh, params) {

//     mesh.geom.SetZindex(params.z, mesh.gfx, params.numFaces)
// }
// function Set_default_zindex(mesh, params) {

//     const defZ = mesh.geom.zIndex;
//     mesh.geom.SetZindex(defZ, mesh.gfx, params.numFaces)
// }