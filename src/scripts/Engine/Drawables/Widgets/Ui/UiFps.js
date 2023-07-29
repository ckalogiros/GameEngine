"use strict";

import { GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GfxInfoMesh } from "../../../../Graphics/GlProgram.js";
import { FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { TimeIntervalsCreate } from "../../../Timer/Time.js";
import { TextGeometry2D } from "../../Geometry/TextGeometry.js";
import { FontMaterial, MAT_ENABLE } from "../../Material.js";
import { TextMesh } from "../../Mesh.js";


const MAX_FPS_NUMBERS = '000000'

export class UiFps{
    
    constTextMesh; // The constant text part(does not change).
    variableTextMesh; // The variable(changing) text part (for the actual fps value)

    constructor(text, pos, scale, fontSize){

        const mat1  = new FontMaterial(WHITE, FONTS.SDF_CONSOLAS_LARGE, text, [.3, .4])
        const geom1 = new TextGeometry2D(pos, fontSize, scale, text, FONTS.SDF_CONSOLAS_LARGE);
        
        this.constTextMesh    = new TextMesh(geom1, mat1);
        
        // Translate the variable text by the width of the constant text width
        pos[0] += (fontSize * 2 * text.length) + fontSize; 
        const mat2  = new FontMaterial(GREEN_140_240_10, FONTS.SDF_CONSOLAS_LARGE, MAX_FPS_NUMBERS, [.5, .4])
        const geom2 = new TextGeometry2D(pos, fontSize, scale, MAX_FPS_NUMBERS, FONTS.SDF_CONSOLAS_LARGE);
        // mat2.Enable(MAT_ENABLE.ATTR_VERTEX_COLOR, { color: [GREEN_33_208_40, YELLOW_240_240_10, PINK_240_60_160, BLUE_10_160_220] })
        this.variableTextMesh = new TextMesh(geom2, mat2);
    }
    
    SetTimerUpdate(msInterval, timerFn){

        // Set an interval timer to update the fps uxi
        const params = {
            timerFn: timerFn,
            mesh: this.variableTextMesh,
        };
        TimeIntervalsCreate(msInterval, 'Ui-fpsUpdate', TIME_INTERVAL_REPEAT_ALWAYS, this.Update, params);

    }
    Update(params){ // TODO: Runs every frame. Make more efficient
        
        const t = params.params.timerFn()
        if(!t || t === undefined) return;

        const textFpsAvg = `${t}`;
        const geom = params.params.mesh.geom;
        const gfx  = params.params.mesh.gfx;
        const mat  = params.params.mesh.mat;

        let gfxInfo = new GfxInfoMesh(gfx);

        const textLen = textFpsAvg.length;
        const len = geom.numChars > textLen ? geom.numChars : (textLen > geom.numChars ? geom.numChars : textLen);

        // const len = textLen;
        for (let i = 0; i < len; i++) {
            /** Update fps average */
            let uvs = [0,0,0,0];
            if(textFpsAvg[i] !== undefined){
                uvs = FontGetUvCoords(mat.uvIdx, textFpsAvg[i]);
            }
            GlSetTex(gfxInfo, uvs);
            gfxInfo.vb.start += gfxInfo.vb.count
        }
    }
}

