"use strict";

import { AnimationsGet } from "../../Engine/Animations/Animations.js";
import { GlowCreate, GlowGetGlow } from "../../Engine/Drawables/Fx/Glow.js";
import { Rect } from "../../Engine/Drawables/Shapes/Rect.js";
import { TextLabel } from "../../Engine/Drawables/Widgets/TextLabel.js";
import { TimerGetGlobalTimer } from "../../Engine/Timer/Timer.js";
import { GlRotate } from "../../Graphics/GlBufferOps.js";
import { GlAddMesh } from "../../Graphics/GlBuffers.js";
import { DimColor } from "../../Helpers/Helpers.js";



class Mechanical extends Rect {

    animations = {
        scaleText: {
            max: INT_NULL,
            min: INT_NULL,
            amt: INT_NULL,
            defAmt: INT_NULL,
        },
    };
    fx = {
        glowIdx: INT_NULL,
    };

    constructor(name, sid, col, dim, scale, tex, pos) {
        super('Mechanical' + name, sid, col, dim, scale, tex, pos, null, null);
    }
};

class Mechanicals {

    buffer;
    count;
    isActive;

    constructor() {
        this.buffer = [];
        this.count = 0;
        this.isActive = false;
    }

    Create(name, col, dim, pos, tex) {
        const sid = SID_DEFAULT_TEXTURE;
        this.buffer[this.count] = new Mechanical(name, sid, col, dim, [1, 1], tex, pos);
        this.buffer[this.count].gfxInfo = GlAddMesh(this.buffer[this.count].sid, this.buffer[this.count].mesh, 1,
            SCENE.finishStage, 'Mechanical', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
        const idx = this.count;
        
        // Create glow effect
        this.buffer[this.count].fx.glowIdx = GlowCreate(pos, PINK_240_60_160, false, true, .2, null);
        // Resize glow mesh 
        const glow = GlowGetGlow(this.buffer[this.count].fx.glowIdx);
        glow.SetDim([50, 50]);
        glow.SetColorAlpha(0);
        
        this.count++;


        return idx;
    }
};

const mechanicals = new Mechanicals;
export function StageCompleteGetMech() {
    return mechanicals;
}


export function StageCompletedCreate() {

    /**
     * Outer Ring
    */
    {
        
        let dim = [
            (ATLAS_ORIG_COOR.STAGE_COMPLETE.OUTER.X[1] - ATLAS_ORIG_COOR.STAGE_COMPLETE.OUTER.X[0]) / 2,
            (ATLAS_ORIG_COOR.STAGE_COMPLETE.OUTER.Y[1] - ATLAS_ORIG_COOR.STAGE_COMPLETE.OUTER.Y[0]) / 2
        ];
        let pos = [Viewport.width / 2, Viewport.height / 2, STAGE_COMPLETE.OUTER.Z_INDEX]
        let tex = ATLAS_TEX_COORDS[ATLAS_TEX_NAMES.STAGE_COMPLETE.OUTER];
        const idx = mechanicals.Create('Outer Ring', DimColor(WHITE, .8), dim, pos, tex);
        STAGE_COMPLETE.OUTER.idx = idx;
    }

    /**
     * Middle Ring
     */
    {
        let dim = [
            (ATLAS_ORIG_COOR.STAGE_COMPLETE.MIDDLE.X[1] - ATLAS_ORIG_COOR.STAGE_COMPLETE.MIDDLE.X[0]) / 2,
            (ATLAS_ORIG_COOR.STAGE_COMPLETE.MIDDLE.Y[1] - ATLAS_ORIG_COOR.STAGE_COMPLETE.MIDDLE.Y[0]) / 2
        ];
        let pos = [Viewport.width / 2, Viewport.height / 2, STAGE_COMPLETE.MIDDLE.Z_INDEX]
        let tex = ATLAS_TEX_COORDS[ATLAS_TEX_NAMES.STAGE_COMPLETE.MIDDLE];
        const idx = mechanicals.Create('Middle Ring', DimColor(WHITE, .8), dim, pos, tex);
        STAGE_COMPLETE.MIDDLE.idx = idx;
    }

    /**
     * Inner Ring
     */
    {
        let dim = [
            (ATLAS_ORIG_COOR.STAGE_COMPLETE.INNER.X[1] - ATLAS_ORIG_COOR.STAGE_COMPLETE.INNER.X[0]) / 2,
            (ATLAS_ORIG_COOR.STAGE_COMPLETE.INNER.Y[1] - ATLAS_ORIG_COOR.STAGE_COMPLETE.INNER.Y[0]) / 2
        ];
        let pos = [Viewport.width / 2, Viewport.height / 2, STAGE_COMPLETE.INNER.Z_INDEX]
        let tex = ATLAS_TEX_COORDS[ATLAS_TEX_NAMES.STAGE_COMPLETE.INNER];
        const idx = mechanicals.Create('Inner Ring', DimColor(WHITE, .8), dim, pos, tex);
        STAGE_COMPLETE.INNER.idx = idx;
    }

    /**
     * Text
     */
    {
        let dim = [
            (ATLAS_ORIG_COOR.STAGE_COMPLETE.TEXT.GOOD.X[1] - ATLAS_ORIG_COOR.STAGE_COMPLETE.TEXT.GOOD.X[0]) / 2,
            (ATLAS_ORIG_COOR.STAGE_COMPLETE.TEXT.GOOD.Y[1] - ATLAS_ORIG_COOR.STAGE_COMPLETE.TEXT.GOOD.Y[0]) / 2
        ];
        let pos = [Viewport.width / 2, Viewport.height / 2, STAGE_COMPLETE.TEXT.Z_INDEX]
        let tex = ATLAS_TEX_COORDS[ATLAS_TEX_NAMES.STAGE_COMPLETE.TEXT.GOOD];
        const idx = mechanicals.Create('Inner Ring', WHITE, dim, pos, tex);
        mechanicals.buffer[idx].animations.scaleText.max = mechanicals.buffer[idx].mesh.dim[0] * 1.8; // Set the max scale for the text's animation
        mechanicals.buffer[idx].animations.scaleText.min = mechanicals.buffer[idx].mesh.dim[0] * 1.4; // Set the min scale for the text's animation
        mechanicals.buffer[idx].animations.scaleText.amt = 1.01; // The ammount of scale per iteration
        mechanicals.buffer[idx].animations.scaleText.defAmt = 1.01; // The ammount of scale per iteration
        STAGE_COMPLETE.TEXT.idx = idx;

    }

    return mechanicals;
}

export function StageCompletedCreateTotalScore(){
    const score = 'Total Score: XXXXXXXXX';
    const style = { pad: 10, roundCorner: 6, border: 0, feather: 30 };
    const showTotalScore = new TextLabel(SCENE.finishStage, 'showTotalScore', score, WHITE,
        TRANSPARENT, [0, 0], [0, 150, 30], style, 8, true, 0.4, ALIGN.CENTER_HOR | ALIGN.TOP);
    return showTotalScore;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Animations
 */

// Rotate Animations
export function StageCompleteAnimationsCreateRotation() {
    const animations = AnimationsGet();
    const indexesToRotate = [STAGE_COMPLETE.OUTER.idx, STAGE_COMPLETE.MIDDLE.idx, STAGE_COMPLETE.INNER.idx]; // The indexes of the meshes to create the rotate animation
    animations.Create(AnimationsCreateRotationStart, AnimationsCreateRotationStop, indexesToRotate, 'StageComplete-Rotate Animation');
}

function AnimationsCreateRotationStart(params) {
    let t = TimerGetGlobalTimer();
    const idxArr = params;
    const len = idxArr.length;
    for (let i = 0; i < len; i++) {
        t *= -1;
        GlRotate(mechanicals.buffer[idxArr[i]].gfxInfo, mechanicals.buffer[idxArr[i]].mesh.dim, t);
    }
    return true;
}
function AnimationsCreateRotationStop() { }

// Scale Text Animation
export function StageCompleteAnimationsCreateScaleText() {
    const animations = AnimationsGet();
    const indexesToAnimate = STAGE_COMPLETE.TEXT.idx; // The indexes of the meshes to create the rotate animation
    animations.Create(AnimationsCreateScaleTextUpStart, AnimationsCreateScaleTextUpStop, indexesToAnimate, 'StageComplete-ScaleText-Up Animation');
}

function Transition(amt, factor){
    return amt*factor;
}

function AnimationsCreateScaleTextUpStart(params) {
    const idx = params;
    const dim = mechanicals.buffer[idx].mesh.dim;
    if (dim[0] < mechanicals.buffer[idx].animations.scaleText.max) {
        mechanicals.buffer[idx].animations.scaleText.amt = Transition(mechanicals.buffer[idx].animations.scaleText.amt, 1.001);
        mechanicals.buffer[idx].SetDim([
            mechanicals.buffer[idx].mesh.dim[0] * mechanicals.buffer[idx].animations.scaleText.amt,
            mechanicals.buffer[idx].mesh.dim[1] * mechanicals.buffer[idx].animations.scaleText.amt
        ]);
        return true;
    }
    else
        return false;
}
function AnimationsCreateScaleTextUpStop() {
    StageCompleteAnimationsCreateScaleTextDown();
}
function StageCompleteAnimationsCreateScaleTextDown() {
    const animations = AnimationsGet();
    const idx = STAGE_COMPLETE.TEXT.idx; // The indexes of the meshes to create the rotate animation
    mechanicals.buffer[idx].animations.scaleText.amt = mechanicals.buffer[idx].animations.scaleText.defAmt;
    animations.Create(AnimationsCreateScaleTextDownStart, AnimationsCreateScaleTextDownStop, idx, 'StageComplete-ScaleText-Down Animation');
}
function AnimationsCreateScaleTextDownStart(params) {
    const idx = params;
    const dim = mechanicals.buffer[idx].mesh.dim;
    if (dim[0] > mechanicals.buffer[idx].animations.scaleText.min) {
        mechanicals.buffer[idx].animations.scaleText.amt = Transition(mechanicals.buffer[idx].animations.scaleText.amt, .994);
        mechanicals.buffer[idx].SetDim([
            mechanicals.buffer[idx].mesh.dim[0] * mechanicals.buffer[idx].animations.scaleText.amt,
            mechanicals.buffer[idx].mesh.dim[1] * mechanicals.buffer[idx].animations.scaleText.amt
        ]);
        return true;
    }
    else
        return false;
}
function AnimationsCreateScaleTextDownStop() { }