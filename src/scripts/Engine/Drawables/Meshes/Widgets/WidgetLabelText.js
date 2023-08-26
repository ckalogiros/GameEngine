"use strict";

import { GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GlGenerateContext } from "../../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh, GlGetProgram } from "../../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../../Helpers/Helpers.js";
import { CopyArr2 } from "../../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../../Collisions.js";
import { MouseGetPos } from "../../../Controls/Input/Mouse.js";
import { FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { TimeIntervalsCreate } from "../../../Timers/TimeIntervals.js";
import { Geometry2D } from "../../Geometry/Base/Geometry.js";
import { Geometry2D_Text } from "../../Geometry/Geometry2DText.js";
import { FontMaterial, Material } from "../../Material/Base/Material.js";
import { MESH_ENABLE, Mesh, Recursive_gfx_operations, Text_Mesh } from "../Base/Mesh.js";



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
export class Widget_Label_Text_Mesh extends Mesh {
// export class Widget_Label_Text_Mesh extends Text_Mesh {

    type = 0;
    pad = [0, 0];

    constructor(text, pos=[200, 300], fontSize, col = GREY3, textCol = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {

        const sdfouter = CalculateSdfOuterFromDim(fontSize);
        if (sdfouter + bold > 1) bold = 1 - sdfouter;
        const textmat = new FontMaterial(textCol, font, text, [bold, sdfouter])
        const textgeom = new Geometry2D_Text(pos, fontSize, scale, text, font);

        // pad[1] *= textmat.numChars/2;

        const areaMetrics = CalculateArea(text, textgeom.dim, pos, pad)
        const areageom = new Geometry2D(areaMetrics.pos, areaMetrics.dim, scale);
        const areamat = new Material(col)

        super(areageom, areamat);

        textgeom.pos[0] += pad[0] * 2; // In essence we set as the left (start of text label) the label area and not the left of text.
        // textgeom.pos[1] += pad[1]; // In essence we set as the left (start of text label) the label area and not the left of text.
        textgeom.pos[2] += 1; // In essence we set as the left (start of text label) the label area and not the left of text.
        
        this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        this.SetStyle(style[0], style[1], style[2]);

        const textMesh = new Text_Mesh(textgeom, textmat);
        textMesh.SetName();

        this.type |= MESH_TYPES_DBG.WIDGET_TEXT_LABEL | textgeom.type | textmat.type | areageom.type | areamat.type;
        this.SetName();
        this.pad = pad;
        this.AddChild(textMesh);
    }

    UpdateText(text) {

        const textMesh = this.children.buffer[0];
        textMesh.mat.text = text; /** CAUTION!: Be sure to initialize the 'textMesh.mat.numChars' 
                                        with the longest text so the vertexBuffers have enough 
                                        space to store the longest text */

        if ((textMesh.type & MESH_TYPES_DBG.TEXT_MESH) === 0) return;

        const geom = textMesh.geom;
        const gfx = textMesh.gfx;
        const mat = textMesh.mat;

        let gfxInfo = new GfxInfoMesh(gfx);

        const textLen = text.length;
        const len = geom.numChars > textLen ? geom.numChars : (textLen > geom.numChars ? geom.numChars : textLen);

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

    CreateGfxCtx(sceneIdx, useSpecificVertexBuffer = GL_VB.ANY, vertexBufferIdx = NO_SPECIFIC_GL_BUFFER) {

        let vbidx1 = null, vbidx2 = null;
        let vbUse1 = null, vbUse2 = null;
        if (Array.isArray(vertexBufferIdx)) {
            vbidx1 = vertexBufferIdx[0];
            vbidx2 = vertexBufferIdx[1];
            vbUse1 = useSpecificVertexBuffer[0];
            vbUse2 = useSpecificVertexBuffer[1];
        }
        else {
            vbidx1 = useSpecificVertexBuffer;
            vbidx2 = useSpecificVertexBuffer;
            vbUse1 = useSpecificVertexBuffer;
            vbUse2 = useSpecificVertexBuffer;
        }

        const gfx = []
        gfx[0] = super.CreateGfxCtx(sceneIdx, vbUse1, vbidx1);
        for (let i = 0; i < this.children.count; i++) {
            if(this.children.buffer[i])
                gfx[i + 1] = this.children.buffer[i].CreateGfxCtx(sceneIdx, vbUse2, vbidx2);
        }

        return gfx;

    }
	
	AddToGfx(){

        
        super.AddToGfx()
        for(let i=0; i<this.children.active_count; i++){
            
            const child = this.children.buffer[i];
			const gfxCopy = new GfxInfoMesh(this.children.buffer[0].gfx);
            
			child.geom.AddToGraphicsBuffer(child.sid, gfxCopy, child.name);
			gfxCopy.vb.start = child.mat.AddToGraphicsBuffer(child.sid, gfxCopy);
            
		}

	}

    Listener_listen_mouse_hover() {
        this.geom.Listener_listen_mouse_hover();
    }

    BringToFront(z) {

        this.geom.SetZindex(z, this.gfx)

        if (this.children.count) {
            const params = {
                z: z + 1, // +1: more close than the label area.
                numFaces: this.children.buffer[0].geom.numChars, // A Label_Text class guarantees the first child (buffer[0]) to be the first character.
            }
            Recursive_gfx_operations(this, Bring_to_front, params)
        }
    }

    SetDefaultZindex() {

        this.geom.SetZindex(this.geom.zIndex, this.gfx)

        if (this.children.count) {
            const params = {
                numFaces: this.children.buffer[0].geom.numChars, // A Label_Text class guarantees the first child (buffer[0]) to be the first character.
            }
            Recursive_gfx_operations(this, Set_default_zindex, params)
        }
    }

    Align_pre(mesh1, flags) { // Align pre-added to the vertexBuffers

        const pos1 = mesh1.geom.pos;
        const dim1 = mesh1.geom.dim;
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

    Align_post(){ // TODO

    }

}


export class Widget_Label_Dynamic_Text extends Widget_Label_Text_Mesh {

    /** Set the max number of characters for the dynamic text, 
     * by passing any text as 'maxDynamicTextChars' of length= dynamic text number of characters*/
    constructor(text, maxDynamicTextChars, pos, fontSize, col, textcol, scale, pad, bold) {

        super(text, pos, fontSize, col, textcol, scale, pad, bold);

        // Translate the dynamic text by the width of the constant text's width
        pos[0] += (fontSize * 2 * text.length) + fontSize + pad[0];
        const dynamicText = new Widget_Label_Text_Mesh(maxDynamicTextChars, pos, fontSize, col, textcol, scale, pad, bold);
        dynamicText.SetName();

        this.AddChild(dynamicText)

        this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | dynamicText.geom.type | dynamicText.mat.type;
        this.SetName();
    }

    CreateGfxCtx(sceneIdx) {

        /** Add the constant text */
        super.CreateGfxCtx(sceneIdx);

        /** Add the dynamic text to the graphics buffer */
        const dynamicText = this.children.buffer[0];
        dynamicText.gfx = GlGenerateContext(dynamicText.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
        const prog = GlGetProgram(dynamicText.gfx.prog.idx);

        if (dynamicText.sid.unif & SID.UNIF.BUFFER_RES) {
            const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
            prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
            prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
        }

        // dynamicText.geom.AddToGraphicsBuffer(dynamicText.sid, dynamicText.gfx, dynamicText.name);
        // dynamicText.mat.AddToGraphicsBuffer(dynamicText.sid, dynamicText.gfx);

        return this.gfx;
        // return [
        //     this.gfx,
        //     dynamicText.gfx,
        // ];
    }

    AddToGfx(){

        super.AddToGfx();
        const dynamicText = this.children.buffer[0];
        dynamicText.geom.AddToGraphicsBuffer(dynamicText.sid, dynamicText.gfx, dynamicText.name);
        dynamicText.mat.AddToGraphicsBuffer(dynamicText.sid, dynamicText.gfx);
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
export class Widget_Label_Text_Mesh_Menu_Options extends Widget_Label_Text_Mesh {

    constructor(text, pos, fontSize, col, textCol, scale, pad, bold, font, style) {

        super(text, pos, fontSize, col, textCol, scale, pad, bold, font, style)
        this.type |= MESH_TYPES_DBG.WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS;
    }

    SetPos(pos) {
        super.SetPos(pos)
    }


    OnClick(_params) {

        const mesh = _params.self_params;
        const point = MouseGetPos();
        const m = mesh.geom;

        if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {

            STATE.mesh.SetClicked(mesh);

            /**
             * For popup menu options and slider connections.
             * If the option is clicked, the we must call the slider connect function
             */
            if (_params.target_params) {

                const target_params = {

                    targetBindingFunctions: _params.target_params.targetBindingFunctions,
                    self_mesh: _params.target_params.self_mesh,
                    target_mesh: _params.target_params.target_mesh,
                    event_type: _params.event_type,
                    /*FOR DEBUG*/clicked_mesh: mesh,
                }
                const EventClbk = _params.target_params.EventClbk;
                console.log('OnClick callback IN. meshId ', mesh.id)
                EventClbk(target_params);
                console.log('OnClick callback OUT. meshId ', mesh.id)
            }
        }
    }

}



function Bring_to_front(mesh, params) {

    mesh.geom.SetZindex(params.z, mesh.gfx, params.numFaces)
}
function Set_default_zindex(mesh, params) {

    const defZ = mesh.geom.zIndex;
    mesh.geom.SetZindex(defZ, mesh.gfx, params.numFaces)
}