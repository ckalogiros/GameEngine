"use strict";

import { GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GfxInfoMesh } from "../../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../../Helpers/Helpers.js";
import { CopyArr2 } from "../../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../../Collisions.js";
import { MouseGetPos, MouseGetPosDif } from "../../../Controls/Input/Mouse.js";
import { Gfx_generate_context } from "../../../Interfaces/Gfx/GfxContext.js";
import { FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { Scenes_remove_root_mesh } from "../../../Scenes.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../Timers/TimeIntervals.js";
import { MESH_ENABLE } from "../Base/Mesh.js";
import { Rect } from "../Rect_Mesh.js";
import { Text } from "../Text_Mesh.js";



function CalculateAreaNoPadding(text, _dim, pos, pad = [0, 0]) {

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
// export class Widget_Label extends Rect {
export class Widget_Label {

    area_mesh;
    text_mesh;
    idx; // Stores the index of the scene's root_mesh buffer, that keeps all scene's root meshes. 
    pad = [0, 0];

    // text, Align, pos, col = GREY3, text_col = WHITE, pad = [0, 0], bold = .4, style = [2, 5, 2], font
    constructor(text='null', Align = (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), pos = [200, 300, 0], fontSize = 8, col = GREY1, text_col = WHITE, pad = [10, 5], bold = .4, style = [0, 6, 2], font = TEXTURES.SDF_CONSOLAS_LARGE) {

        const sdfouter = CalculateSdfOuterFromDim(fontSize);
        if (sdfouter + bold > 1) bold = 1 - sdfouter;
        pos[2] += 1; // In essence we set as the left (start of text label) the label area and not the left of text.

        /** Label tex mesh */
        this.text_mesh = new Text(text, pos, fontSize);

        pos[0] -= pad[0] * 2; // In essence we set as the left (start of text label) the label area and not the left of text.
        pos[2] -= 1; // Set z for area 'behind' this.text_mesh

        const areaMetrics = CalculateArea(text, this.text_mesh.geom.dim, pos, pad)

        /** Label area mesh */
        this.area_mesh = new Rect(areaMetrics.pos, areaMetrics.dim, col);

        this.area_mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        this.area_mesh.SetStyle(style);

        this.text_mesh.SetName('Text ' + text);
        this.text_mesh.SetSceneIdx(this.area_mesh.sceneIdx);

        this.type |= MESH_TYPES_DBG.WIDGET_TEXT_LABEL | this.text_mesh.type | this.area_mesh.geom.type | this.area_mesh.mat.type;
        this.area_mesh.SetName('label area ' + text);
        this.pad = pad;
        // this.area_mesh.AddChild(this.text_mesh);

        this.text_mesh.Align_pre(this, Align, pad)
    }

    Destroy() {

        const sceneidx = this.area_mesh.sceneidx;
        this.text_mesh.Destroy();
        this.area_mesh.Destroy();
        Scenes_remove_root_mesh(this, sceneidx);
        this.text_mesh = null;
        this.area_mesh = null;
    }

    /*******************************************************************************************************************************************************/
    // Graphics
    GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]) {

        this.area_mesh.gfx = Gfx_generate_context(this.area_mesh.sid, this.area_mesh.sceneIdx, this.area_mesh.mat.num_faces, FLAGS, gfxidx);
        this.text_mesh.gfx = Gfx_generate_context(this.text_mesh.sid, this.text_mesh.sceneIdx, this.text_mesh.mat.num_faces, FLAGS, gfxidx);
        return this.area_mesh.gfx;
    }

    Render() {

        if(!this.area_mesh.is_gfx_inserted) {this.area_mesh.AddToGfx(); this.area_mesh.is_gfx_inserted = true}
        if(!this.text_mesh.is_gfx_inserted) {this.text_mesh.AddToGfx(); this.text_mesh.is_gfx_inserted = true}
    }

    /*******************************************************************************************************************************************************/
    // Setters-Getters

    SetSceneIdx(sceneidx) {
        this.area_mesh.sceneidx = sceneidx;
        this.text_mesh.sceneidx = sceneidx;
    }

    /** Return type: Array. Returns an array of all widgets meshes */
    GetAllMeshes() {

        return [this.area_mesh, this.text_mesh];
    }
    
    /*******************************************************************************************************************************************************/
    // Alignment
    Align(flags, target_mesh, pad=[0,0]) { // Align pre-added to the vertexBuffers

        const pos = [0, 0];
        CopyArr2(pos, this.area_mesh.geom.pos);

        if (flags & (ALIGN.VERT_CENTER | ALIGN.RIGHT)) {

            // Vertical allignment
            pos[1] = target_mesh.geom.pos[1];

            // Horizontal allignment
            pos[0] = target_mesh.geom.pos[0] + target_mesh.geom.dim[0] - this.area_mesh.geom.dim[0] - pad[0];
            CopyArr2(this.area_mesh.geom.pos, pos);

        }
        else if (flags & ALIGN.RIGHT) {

            // Horizontal allignment
            pos[0] = target_mesh.geom.pos[0] + target_mesh.geom.dim[0] - this.area_mesh.geom.dim[0] - pad[0];
            CopyArr2(this.area_mesh.geom.pos, pos);

        }
        else if (flags & ALIGN.LEFT) {

            // Horizontal allignment
            pos[0] = (target_mesh.geom.pos[0] - target_mesh.geom.dim[0]) + this.area_mesh.geom.dim[0] + pad[0];
            CopyArr2(this.area_mesh.geom.pos, pos);

        }

        /**
         * If the alignment happens after the widgets insertion to 
         * the vertex buffers, we must update the vertex buffers too.
         * If the target_mesh is of type 'Text', we must update all characters one by one.
         */

        if(this.area_mesh.is_gfx_inserted){


        }

    }

    Align_post(flags, target_mesh, pad=[0,0]){ // Align and update gfx buffers

        /**
         * If the target_mesh is of type 'Text', we must update all characters in the vertex buffers.
         */

        this.Align_pre(flags, target_mesh, pad);
    }

    Reposition_pre(){}

    Reposition_post(dif_pos){

        this.MoveXYZ(dif_pos)
        this.text_mesh.MoveXYZ(dif_pos)
    }

    /*******************************************************************************************************************************************************/
    // Listeners
    /**
     * @param {*} event_type typeof 'LISTEN_EVENT_TYPES'
     * @param {*} Clbk User may choose the callback for the listen event.
     */
    CreateListenEvent(event_type, Clbk = null) {

        const target_params = {
            EventClbk: null,
            targetBindingFunctions: null,
            // clicked_mesh: this.area_mesh,
            target_mesh: this,
            params: null,
        }

        if (Clbk) this.area_mesh.AddEventListener(event_type, Clbk, target_params);
        else this.area_mesh.AddEventListener(event_type, this.OnClick, target_params);
    }

    OnClick(params) {

        const mesh = params.target_params.target_mesh;
        const area_mesh = mesh.area_mesh;
        const text_mesh = mesh.text_mesh;
        const OnMoveFn  = mesh.OnMove;

        const point = MouseGetPos();
        const g = area_mesh.geom;
        if (Check_intersection_point_rect(g.pos, g.dim, point, [0, 8])) {

            STATE.mesh.SetClicked(area_mesh);
            console.log('Clicked:', area_mesh.name)

            if (area_mesh.timeIntervalsIdxBuffer.boundary <= 0) {

                /**
                 * Create Move event.
                 * The Move event runs only when the mesh is GRABED. That means that the timeInterval 
                 * is created and destroyed upon 'onClickDown' and 'onClickUp' respectively.
                 */
                const idx = TimeIntervalsCreate(10, 'Move Widget_Text', TIME_INTERVAL_REPEAT_ALWAYS, OnMoveFn, { area_mesh: area_mesh, text_mesh: text_mesh });
                area_mesh.timeIntervalsIdxBuffer.Add(idx);

                if (area_mesh.StateCheck(MESH_STATE.IS_GRABABLE)) {

                    STATE.mesh.SetGrabed(area_mesh);
                    area_mesh.StateEnable(MESH_STATE.IN_GRAB);
                }

            }
            return true;
        }
        return false;
    }

    OnMove(params) {

        // The 'OnMove' function is called by the timeInterval.
        // The timeInterval has been set by the 'OnClick' event.
        const area_mesh = params.params.area_mesh;
        const text_mesh = params.params.text_mesh;

        // Destroy the time interval and the Move operation, if the mesh is not grabed
        // MESH_STATE.IN_GRAB is deactivated upon mouse click up in Events.js.
        if (area_mesh.StateCheck(MESH_STATE.IN_GRAB) === 0) {

            const intervalIdx = area_mesh.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
            TimeIntervalsDestroyByIdx(intervalIdx);
            area_mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

            return;
        }

        // Move 
        const mouse_pos = MouseGetPosDif();
        area_mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, area_mesh.gfx);
        text_mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, text_mesh.gfx);

    }

}


export class Widget_Label_Dynamic_Text extends Widget_Label {

    /** Set the max number of characters for the dynamic text, 
     * by passing any text as 'maxDynamicTextChars' of length= dynamic text number of characters*/
    constructor(text1, Align, text2, pos, fontSize = 4, col, textcol, scale, pad = [10, 10], bold) {

        super(text1, Align, pos, fontSize, col, textcol, scale, pad, bold);

        // Translate the dynamic text by the width of the constant text's width
        CopyArr2(pos, this.geom.pos)
        this.pad = [5, 5]
        pos[0] += this.geom.dim[0] + this.pad[0] * 2;

        const dynamicText = new Widget_Label(text2, ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, pos, fontSize, YELLOW_240_220_10, textcol, scale, this.pad, bold);
        dynamicText.SetName('Dynamic Text ' + text1.slice(0, 7));

        this.AddChild(dynamicText)

        this.type |= MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC | dynamicText.geom.type | dynamicText.mat.type;
        this.SetName('Dynamic Text area ' + text1.slice(0, 7));
    }

    GenGfxCtx(FLAGS, gfxidx) {

        const gfx = super.GenGfxCtx(FLAGS, gfxidx);
        return gfx;
    }

    AddToGfx() {

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

    constructor(text, Align, pos, fontSize, col, textCol, scale, pad, bold, font, style) {

        super(text, Align, pos, fontSize, col, textCol, scale, pad, bold, font, style)
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


    OnClick(params) {

        const mesh = params.source_params;
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
            if (params.target_params) {

                const target_params = {

                    targetBindingFunctions: params.target_params.targetBindingFunctions,
                    self_mesh: params.target_params.clicked_mesh,
                    target_mesh: params.target_params.target_mesh,
                    event_type: params.event_type,
                    /*FOR DEBUG*/clicked_mesh: mesh,
                }
                const EventClbk = params.target_params.EventClbk;
                console.log('OnClick callback IN. meshId ', mesh.id)
                EventClbk(target_params);
                console.log('OnClick callback OUT. meshId ', mesh.id)
            }

            return true;
        }

        return false;
    }


}