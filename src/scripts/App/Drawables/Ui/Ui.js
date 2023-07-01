"use strict";
import { CreateText } from "../../../Engine/Drawables/Text.js";
import { GlSetScale, GlSetColor, GlSetTex, GlSetWposXY, GlSetDim } from "../../../Graphics/GlBufferOps.js";
import { GlAddMesh } from "../../../Graphics/GlBuffers.js";
import { FontGetUvCoords } from "../../../Engine/Loaders/Font/LoadFont.js";
import * as math from "../../../Helpers/Math/MathOperations.js"
import { AnimationsGet } from "../../../Engine/Animations/Animations.js";
import { TimeIntervalsCreate, FpsGet } from "../../../Engine/Timer/Time.js";
import { ExplosionSimpleSetTranslation, ExplosionsCreateSimpleExplosion } from "../../../Engine/Drawables/Fx/Explosions.js";
import { GlowCreate } from "../../../Engine/Drawables/Fx/Glow.js";
import { VortexUpdateAttribParams1_Count } from "../../../Engine/Drawables/Fx/Vortex.js";
import { TimerResetGlobalTimer } from "../../../Engine/Timer/Timer.js";


const UI_Y_POS_ROW1 = GAME_AREA_TOP + 20;
const UI_Y_POS_ROW2 = UI_Y_POS_ROW1 * 2;
const PADD = 15;

// Score's for different kinds of achievments
const SCORE_FOR = {
    BRICK: 10,
};

const UI_SDF_INNER_PARAMS = 0.4;

// Exporting is only for the class type(to compare with the instanceof operator)
export class UiTextVariable {

    constText;   // Constant text(unchangable)
    variText;   // Variable text(text that changes)
    val;
    maxLen; // Max length of the char digits
    style = { pad: 0, roundCorner: 0, border: 0, feather: 0, };
    fx = { glowIdx: 0, };

    constructor(style, numDigits) {
        this.maxLen = numDigits; // Max length of the char digits
        this.val = NUM_DIGITS_TABLE[numDigits]; // The numerical value of the variable text. The number of digits denotes the max length of characters for any variable ui text number
        this.style.pad = style.pad;
        this.style.roundCorner = style.roundCorner;
        this.style.border = style.border;
        this.style.feather = style.feather;
        this.fx.glowIdx = INT_NULL;
        this.constText = null;   // Constant text(unchangable)
        this.variText = null;   // Variable text(text that changes)
    }

    GetGfxIdx() {
        /** Get all widget's progs and vertexBuffer indexes */
        const gfxIdx = [
            [this.constText.letters[0].gfxInfo.prog.idx, this.constText.letters[0].gfxInfo.vb.idx],
        ];
        return gfxIdx;
    }
    GetVariPos() {
        return this.variText.pos;
    }
};

const uiTexts = [];

export function UiGet() {
    return uiTexts;
}
export function UiGetUi(idx) {
    return uiTexts[idx];
}
export function UiGetScore() {
    if (uiTexts.length)
        return uiTexts[UI_TEXT.SCORE].val;
    else return '0';
}
export function UiResetScore() {
    uiTexts[UI_TEXT.SCORE].val = 0;
}
export function UiGetTotalScore() {
    if (uiTexts.length)
        return uiTexts[UI_TEXT.TOTAL_SCORE].val;
    else return '0';
}
export function UiSetTotalScore(totalScore) {
    uiTexts[UI_TEXT.TOTAL_SCORE].val = totalScore;
}




function UiCreate(uiText, sceneIdx, constTextStr, variTextStr, constTextcol, variTextcol, pos, fontSize, style, Align, GL_BUFFER, vbIdx) {

    // If we align from the right, create the variable text first.
    if (Align & ALIGN.RIGHT) {
        // Create the unchanged text
        uiText.variText = CreateText(
                uiText.val.toString(),
                variTextcol,
                [],
                pos,
                uiText.style,
                fontSize,
                true,
                UI_SDF_INNER_PARAMS,
                Align
            );

        // Create the changed text (it is numerical value in most cases)
        pos[0] -= uiText.variText.dim[0] * 2;
        uiText.constText = CreateText(
                constTextStr,
                constTextcol,
                [],
                pos,
                uiText.style,
                fontSize,
                true,
                UI_SDF_INNER_PARAMS,
                Align
            );
    }
    else {
        // Create the unchanged text
        uiText.constText = CreateText(
            constTextStr,
            constTextcol,
            [],
            pos,
            uiText.style,
            fontSize,
            true,
            UI_SDF_INNER_PARAMS,
            Align
        );

        // Create the changed text (it is numerical value in most cases)
        pos[0] += uiText.constText.dim[0] * 2;
        // uiText.variText = CreateText(uiText.val.toFixed(1), variTextcol, [], pos, uiText.style, fontSize, true, UI_SDF_INNER_PARAMS, Align);
        uiText.variText = CreateText(
            uiText.val.toString(),
            variTextcol,
            [],
            pos,
            uiText.style,
            fontSize,
            true,
            UI_SDF_INNER_PARAMS,
            Align
        );
    }

    // Add constText meshes to Gl buffers 
    for (let i = 0; i < uiText.constText.letters.length; i++) {
        // Update the unchanged text's x pos to fit with the variable text's pos x.
        uiText.constText.letters[i].gfxInfo = GlAddMesh(
            uiText.constText.sid,
            uiText.constText.letters[i],
            1,
            sceneIdx,
            `Ui-${constTextStr}-const`,
            GL_BUFFER,
            vbIdx
        );
        GL_BUFFER = GL_VB.SPECIFIC;
        vbIdx = uiText.constText.letters[i].gfxInfo.vb.idx;
    }

    for (let i = 0; i < uiText.variText.letters.length; i++) {
        // Update the unchanged text's x pos to fit with the variable one
        uiText.variText.letters[i].gfxInfo = GlAddMesh(
            uiText.constText.sid,
            uiText.variText.letters[i],
            1,
            sceneIdx,
            `Ui-${constTextStr}-variable`,
            GL_VB.SPECIFIC,
            vbIdx
        );
    }

    // Reset the uiText value (after initializing constText faces from max number display of '100000') to 0,
    // Update all faces with space character and a 0 at the start
    uiText.val = 0;
    for (let i = 0; i < uiText.variText.letters.length; i++) {

        let uvs = [];
        if (variTextStr[i]) // Set the uvs for the variable text
            uvs = FontGetUvCoords(variTextStr[i]);
        else // else fill up the remaining characters with space until max characters
            uvs = FontGetUvCoords(' ');

        GlSetTex(uiText.variText.letters[i].gfxInfo, uvs);
        uiText.variText.letters[i].tex = uvs;
    }

    return uiText;
}
export function UiUpdate(uiTextIndex, val) {

    uiTexts[uiTextIndex].val += val;
    const text = uiTexts[uiTextIndex].val.toFixed(1); // toFixed: floating point digits

    for (let i = 0; i < text.length; i++) {
        const uvs = FontGetUvCoords(text[i]);
        GlSetTex(uiTexts[uiTextIndex].variText.letters[i].gfxInfo, uvs);
        uiTexts[uiTextIndex].variText.letters[i].tex = uvs;
    }
}

/** Create Ui's */
export function UiCreateScore(sceneIdx) {

    const pos = [-PADD, UI_Y_POS_ROW1, 4];
    const fontSize = UI_TEXT.FONT_SIZE;
    const style = { pad: 10, roundCorner: 6, border: 2, feather: 12, };

    const numDigits = 6;
    const uiText = new UiTextVariable(style, numDigits);
    uiTexts[UI_TEXT.SCORE] = UiCreate(uiText, sceneIdx, 'Score: ', '0',
        WHITE, YELLOW_240_220_10, pos, fontSize, style, ALIGN.RIGHT | ALIGN.TOP, GL_VB.SPECIFIC, NO_SPECIFIC_GL_BUFFER);

    return uiTexts[UI_TEXT.SCORE];
}
export function UiCreateTotalScore(sceneIdx) {

    // const pos = [-70, UI_Y_POS_ROW1, 4];
    const pos = [PADD, UI_Y_POS_ROW1, 4];
    const fontSize = UI_TEXT.FONT_SIZE;
    const style = { pad: 10, roundCorner: 6, border: 2, feather: 12, };

    const numDigits = 9;
    const uiText = new UiTextVariable(style, numDigits);
    uiTexts[UI_TEXT.TOTAL_SCORE] = UiCreate(uiText, sceneIdx, 'Total Score: ', '0',
        WHITE, GREEN_60_240_100, pos, fontSize, style, ALIGN.LEFT | ALIGN.TOP, GL_VB.SPECIFIC, NO_SPECIFIC_GL_BUFFER);

    return uiTexts[UI_TEXT.TOTAL_SCORE];
}
export function UiCreateScoreModifier(sceneIdx) {

    const pos = [PADD, UI_Y_POS_ROW2 + 25, 4];
    const fontSize = UI_TEXT.FONT_SIZE;
    const style = { pad: 10, roundCorner: 6, border: 2, feather: 12, };

    const numDigits = 6;
    const uiText = new UiTextVariable(style, numDigits);
    uiText.val = uiText.val.toFixed(1);
    uiTexts[UI_TEXT.SCORE_MOD] = UiCreate(uiText, sceneIdx, 'Score mod x ', '0',
        WHITE, ORANGE_240_130_10, pos, fontSize, style, ALIGN.LEFT | ALIGN.TOP, GL_VB.SPECIFIC, NO_SPECIFIC_GL_BUFFER);

    return uiTexts[UI_TEXT.SCORE_MOD];
}
export function UiCreateLives(sceneIdx) {

    const pos = [-PADD, UI_Y_POS_ROW2 + 25, 4];
    const fontSize = UI_TEXT.FONT_SIZE;
    const style = { pad: 10, roundCorner: 6, border: 2, feather: 12, };

    const numDigits = 1;
    const uiText = new UiTextVariable(style, numDigits);
    uiTexts[UI_TEXT.LIVES] = UiCreate(uiText, sceneIdx, 'Lives: ', '3',
        WHITE, YELLOW_240_220_10, pos, fontSize, style, ALIGN.RIGHT | ALIGN.TOP, GL_VB.SPECIFIC, NO_SPECIFIC_GL_BUFFER);

    return uiTexts[UI_TEXT.LIVES];
}
export function UiCreateCombo(sceneIdx) {

    const pos = [0, UI_Y_POS_ROW2 + 25, 4];
    const fontSize = UI_TEXT.FONT_SIZE;
    const style = { pad: 10, roundCorner: 6, border: 2, feather: 12, };

    const numDigits = 3;
    const uiText = new UiTextVariable(style, numDigits);
    uiTexts[UI_TEXT.COMBO] = UiCreate(uiText, sceneIdx, 'Combo', 'x0', WHITE,
        PINK_240_60_160, pos, fontSize, style, ALIGN.CENTER_HOR | ALIGN.TOP, GL_VB.SPECIFIC, NO_SPECIFIC_GL_BUFFER);

    // const glowpos = [uiTexts[UI_TEXT.COMBO].variText.pos[0] + 10, uiTexts[UI_TEXT.COMBO].variText.pos[1]];
    // uiTexts[UI_TEXT.COMBO].fx.glowIdx = GlowCreate(glowpos, blue, false, true, .2, 1);

    return uiTexts[UI_TEXT.COMBO];
}
export function UiCreateFps(sceneIdx) {

    const pos = [PADD, -40, 4];
    const fontSize = UI_TEXT.FONT_SIZE-1;
    const style = { pad: 10, roundCorner: 6, border: 2, feather: 12, };

    pos[1] = -(UI_TEXT.FONT_SIZE*2+5); // Leave space for the worst ui fps 
    // Average Fps
    const numDigits = 5;
    const uiText_avg = new UiTextVariable(style, numDigits);
    uiTexts[UI_TEXT.FPS.AVG] = UiCreate(uiText_avg, sceneIdx, 'FPS Avg: ', '0', WHITE,
        YELLOW_240_220_10, pos, fontSize, style, ALIGN.LEFT | ALIGN.BOTTOM, GL_VB.NEW, NO_SPECIFIC_GL_BUFFER);

    // Get the vertex buffer index that the fps gets drawn
    const vbIdx = uiTexts[UI_TEXT.FPS.AVG].constText.letters[0].gfxInfo.vb.idx;
    // Average 1 second Fps
    pos[0] = -PADD;
    const uiText_avg1s = new UiTextVariable(style, numDigits);
    uiTexts[UI_TEXT.FPS.AVG_1S] = UiCreate(uiText_avg1s, sceneIdx, 'FPS Avg 1s: ', '0',
        WHITE, YELLOW_240_220_10, pos, fontSize, style, ALIGN.RIGHT | ALIGN.BOTTOM, GL_VB.SPECIFIC, vbIdx);

    pos[0] = PADD;
    pos[1] -= (UI_TEXT.FONT_SIZE*2 + 5); // Leave space for the worst ui fps 
    const uiText_worstAvg = new UiTextVariable(style, numDigits);
    uiTexts[UI_TEXT.FPS.WORST_AVG] = UiCreate(uiText_worstAvg, sceneIdx, 'Worst FPS Avg: ', '0',
        WHITE, MAGENTA_RED, pos, fontSize, style, ALIGN.LEFT | ALIGN.BOTTOM, GL_VB.SPECIFIC, vbIdx);

    pos[0] = -PADD;
    const uiText_worst = new UiTextVariable(style, numDigits);
    uiTexts[UI_TEXT.FPS.WORST_FPS] = UiCreate(uiText_worst, sceneIdx, 'Worst FPS: ', '0',
        WHITE, MAGENTA_RED, pos, fontSize, style, ALIGN.RIGHT | ALIGN.BOTTOM, GL_VB.SPECIFIC, vbIdx);

    // Set an interval timer to update the fps ui
    TimeIntervalsCreate(800, 'Ui-fpsUpdate', TIME_INTERVAL_REPEAT_ALWAYS, UiUpdateFps);

    return [
        uiTexts[UI_TEXT.FPS.AVG],
        uiTexts[UI_TEXT.FPS.AVG_1S],
        uiTexts[UI_TEXT.FPS.WORST_AVG],
        uiTexts[UI_TEXT.FPS.WORST_FPS],
    ];
}

/** Update Ui's */
export function UiIncrementScore() {

    let score = uiTexts[UI_TEXT.SCORE].val;
    score = score + (SCORE_FOR.BRICK * uiTexts[UI_TEXT.SCORE_MOD].val);
    const text = Math.floor(score).toString();
    const len = text.length;
    for (let i = 0; i < len; i++) {
        const uvs = FontGetUvCoords(text[i]);
        GlSetTex(uiTexts[UI_TEXT.SCORE].variText.letters[i].gfxInfo, uvs);
        uiTexts[UI_TEXT.SCORE].variText.letters[i].tex = uvs;
    }

    uiTexts[UI_TEXT.SCORE].val = score;
}
export function UiUpdateScore() {

    let score = uiTexts[UI_TEXT.SCORE].val;
    const text = Math.floor(score).toString();

    let uvs = FontGetUvCoords(' ');
    for (let i = 0; i < uiTexts[UI_TEXT.SCORE].maxLen; i++) {
        if (text[i]) {
            const uvs = FontGetUvCoords(text[i]);
        }
        GlSetTex(uiTexts[UI_TEXT.SCORE].variText.letters[i].gfxInfo, uvs);
        uiTexts[UI_TEXT.SCORE].variText.letters[i].tex = uvs;
    }
}
export function UiUpdateTotalScore() {

    const score = uiTexts[UI_TEXT.TOTAL_SCORE].val;
    const text = Math.floor(score).toString();
    const len = text.length;
    for (let i = 0; i < len; i++) {
        const uvs = FontGetUvCoords(text[i]);
        GlSetTex(uiTexts[UI_TEXT.TOTAL_SCORE].variText.letters[i].gfxInfo, uvs);
        uiTexts[UI_TEXT.TOTAL_SCORE].variText.letters[i].tex = uvs;
    }
}
export function UiUpdateCombo(combo) {

    let text = 'x' + Math.floor(combo).toString();
    const len = uiTexts[UI_TEXT.COMBO].variText.letters.length;
    for (let i = 0; i < len; i++) {
        let uvs = FontGetUvCoords(' ');
        if (text[i]) {
            uvs = FontGetUvCoords(text[i]);
        }
        GlSetTex(uiTexts[UI_TEXT.COMBO].variText.letters[i].gfxInfo, uvs);
        uiTexts[UI_TEXT.COMBO].variText.letters[i].tex = uvs;
    }

    // Update Vortex 
    TimerResetGlobalTimer();
    VortexUpdateAttribParams1_Count(combo);
}
export function UiUpdateFps() {

    const fps = FpsGet()
    const textFpsAvg = `${fps.GetAvg()}`;
    const textFpsAvg1s = `${fps.GetAvg_1S()}`;
    const textFpsWorst = `${fps.GetWorst()}`;
    const textFpsWorstAvg = `${fps.GetWorstAvg()}`;

    for (let i = 0; i < uiTexts[UI_TEXT.FPS.AVG].maxLen; i++) {
        /** Update fps average */
        let uvs1 = FontGetUvCoords(' ');
        if (textFpsAvg[i]) {
            uvs1 = FontGetUvCoords(textFpsAvg[i]);
        }
        GlSetTex(uiTexts[UI_TEXT.FPS.AVG].variText.letters[i].gfxInfo, uvs1);
        uiTexts[UI_TEXT.FPS.AVG].variText.letters[i].tex = uvs1;

        /** Update 1 second fps average */
        let uvs2 = FontGetUvCoords(' ');
        if (textFpsAvg1s[i]) {
            uvs2 = FontGetUvCoords(textFpsAvg1s[i]);
        }
        GlSetTex(uiTexts[UI_TEXT.FPS.AVG_1S].variText.letters[i].gfxInfo, uvs2);
        uiTexts[UI_TEXT.FPS.AVG_1S].variText.letters[i].tex = uvs2;

        /** Update 1 second fps average */
        let uvs3 = FontGetUvCoords(' ');
        if (textFpsWorst[i]) {
            uvs3 = FontGetUvCoords(textFpsWorst[i]);
        }
        GlSetTex(uiTexts[UI_TEXT.FPS.WORST_FPS].variText.letters[i].gfxInfo, uvs3);
        uiTexts[UI_TEXT.FPS.WORST_FPS].variText.letters[i].tex = uvs3;

        /** Update 1 second fps average */
        let uvs4 = FontGetUvCoords(' ');
        if (textFpsWorstAvg[i]) {
            uvs4 = FontGetUvCoords(textFpsWorstAvg[i]);
        }
        GlSetTex(uiTexts[UI_TEXT.FPS.WORST_AVG].variText.letters[i].gfxInfo, uvs4);
        uiTexts[UI_TEXT.FPS.WORST_AVG].variText.letters[i].tex = uvs4;
    }
}

/** Ui Animations */
export function UiComboCreateAnimation(idx) {
    const animation = AnimationsGet();
    animation.Create(ComboStartAnimation, ComboStopAnimation, idx);
}
function ComboStartAnimation(i) {

}
function ComboStopAnimation() {

}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Create animated score modifier text for every score mod earning */
const MODS_MAX_COUNT = 32;
class AnimText {
    text = null;
    isActive = false;
    inAnimation = false;
    fontSize = 0;
    animation = {
        scaleFactor: 1,
        inUpScale: false,
        inColorFade: false,
        yAdvance: 8.,
        colorDim: 1.,
    };
    explosion = {
        // Case we also have an explosion running allong the textAnim 
        //and we need to keep track the explosions object index for refference
        idx: INT_NULL,
    };

    constructor(sid, txt, col, dim, pos, style, fontSize, useSdfFont, align) {
        this.fontSize = fontSize;
        this.text = CreateText(txt, col, dim, pos, style, fontSize, useSdfFont, UI_SDF_INNER_PARAMS, align);
    }
};

// Score Modifiers
export class AnimTexts {

    buffer = [];
    count = 0;
    size = MODS_MAX_COUNT;

    constructor() {

    }

    Init(sid, fontSize, sceneIdx, vbIdx) {
        for (let i = 0; i < MODS_MAX_COUNT; i++) {

            const text = '9999';
            this.buffer[i] = new AnimText(sid, text, TRANSPARENT, [0, 0], [0, 0, UI_TEXT.Z_INDEX], null, fontSize, true, ALIGN.NONE);
            for (let j = 0; j < this.buffer[i].text.letters.length; j++) {
                // this.buffer[i].text.letters[j].gfxInfo = GlAddMesh(this.buffer[i].text.sid, this.buffer[i].text.letters[j], 1, sceneIdx, 'Ui-Mod', GL_VB.SPECIFIC, vbIdx);
                this.buffer[i].text.letters[j].gfxInfo = GlAddMesh(this.buffer[i].text.sid, this.buffer[i].text.letters[j], 1, sceneIdx, 'Ui-AnimText', GL_VB.SPECIFIC, NO_SPECIFIC_GL_BUFFER);
            }
            this.buffer[i].text.gfxInfo = this.buffer[i].text.letters[0].gfxInfo;
        }
    }
    GetNextFree() {
        for (let i = 0; i < this.size; i++) {
            if (!this.buffer[i].isActive)
                return { mod: this.buffer[i], idx: i };
        }
        return null;
    }
    GetGfxIdx() {
        /** Get all widget's progs and vertexBuffer indexes */
        const gfxIdx = [
            [this.buffer[0].text.gfxInfo.prog.idx, this.buffer[0].text.gfxInfo.vb.idx],
        ];
        return gfxIdx;
    }
}

const animTexts = new AnimTexts;


export function AnimTextsInit(sceneIdx) {

    const sid = SID_DEFAULT_TEXTURE_SDF;
    const fontSize = UI_TEXT.FONT_SIZE / 2;

    animTexts.Init(sid, fontSize, sceneIdx);
    return animTexts;
}


// const UI_MOD_COLOR = GREEN_33_208_40;
// const UI_MOD_COLOR = ORANGE_230_148_0;
// const UI_MOD_COLOR = blue;
const UI_MOD_COLOR = YELLOW;
// const UI_MOD_COLOR = DarkenColor(ORANGE_255_164_0, .5);


/** ANIMATIONS */
export function AnimTextsCreateValue(targetPos, modVal) {

    let pos = [];
    pos[0] = targetPos[0];
    pos[1] = targetPos[1];
    pos[2] = UI_TEXT.Z_INDEX;

    const obj = animTexts.GetNextFree();
    if (obj) {
        const mod = obj.mod;
        GlSetColor(mod.text.letters[0].gfxInfo, WHITE);
        const text = '+' + modVal.toFixed(1);
        const textHalfWidth = text.length * (mod.fontSize);
        math.CopyArr3(mod.text.pos, pos);
        pos[0] = pos[0] - textHalfWidth;
        mod.text.dim[0] = textHalfWidth;

        // Init attributes for each mod's text character
        for (let j = 0; j < text.length; j++) {
            // Set default scale
            math.CopyArr2(mod.text.letters[j].dim, mod.text.letters[j].defDim);

            mod.text.letters[j].scale[0] = 1;
            mod.text.letters[j].scale[1] = 1;
            GlSetScale(mod.text.letters[j].gfxInfo, [1, 1])

            // Color the mod depending on the some characteristics
            math.CopyArr4(mod.text.letters[j].col, UI_MOD_COLOR);
            GlSetColor(mod.text.letters[j].gfxInfo, UI_MOD_COLOR);

            // Set as position the bricks position
            mod.text.letters[j].pos[0] = pos[0];
            mod.text.letters[j].pos[1] = pos[1];
            GlSetWposXY(mod.text.letters[j].gfxInfo, pos);
            pos[0] += mod.text.letters[j].dim[0] * 2;
            // mod.text.dim[0] += pos[0];

            // Set texture coordinates
            const uvs = FontGetUvCoords(text[j]);
            GlSetTex(mod.text.letters[j].gfxInfo, uvs);
            mod.text.letters[j].tex = uvs;
        }

        mod.isActive = true;
        mod.inAnimation = true;
        mod.animation.inUpScale = true;
        mod.animation.inColorFade = false;
        mod.animation.scaleFactor = 1.07;
        mod.animation.yAdvance = 3.;
        mod.animation.colorDim = .999;
        uiTexts[UI_TEXT.SCORE_MOD].val += modVal;

        // Update the score adding the hit value * the mod value
        // UiIncrementScore(uiTexts[UI_TEXT.SCORE_MOD].val);
        UiIncrementScore();
        AnimTextsCreateAnimation(obj.idx);
        mod.explosion.idx = ExplosionsCreateSimpleExplosion(mod.text.pos, WHITE, 1, .02);
        return;
    }

}
export function AnimTextsCreateAnimation(idx) {
    const animation = AnimationsGet();
    animation.Create(AnimTextsStartAnimation, AnimTextsStopAnimation, idx);
}
function AnimTextsStartAnimation(i) {

    if (!animTexts.buffer.length) return false;

    if (animTexts.buffer[i].isActive) {

        // TODO: animTexts.buffer[i].text.letters.length  = 4 but the text may be 2 chars. 
        let colorFactor = 0.9991;
        const yFactor = .93;
        let accumTextWidth = 0;


        // So we set unused data. FIX IT
        for (let j = 0; j < animTexts.buffer[i].text.letters.length; j++) {
            // Set dim color
            math.MulArr4Val(animTexts.buffer[i].text.letters[j].col, animTexts.buffer[i].animation.colorDim);
            GlSetColor(animTexts.buffer[i].text.letters[j].gfxInfo, animTexts.buffer[i].text.letters[j].col);

            // Scale
            /**
             * Explenation
             * If the scale is 1, scale up.
             * If the scale surpass 5, scale down the scale factor.
             *      Actualy slows down the scale up.
             * If the scale factor becomes a minimum ammount, set a very slow scale up,  while the text fades away.
             *      
             */
            const scalex = animTexts.buffer[i].text.letters[j].scale[0];
            if (animTexts.buffer[i].animation.inUpScale && scalex > 2.) {
                animTexts.buffer[i].animation.scaleFactor *= 0.997;
                if (animTexts.buffer[i].animation.scaleFactor <= 1.003) { // Smooth transition to the new scale value
                    animTexts.buffer[i].animation.scaleFactor = 1.003;
                    animTexts.buffer[i].animation.inUpScale = false;
                    animTexts.buffer[i].animation.inColorFade = true;
                }
            }
            // Fade color
            if (animTexts.buffer[i].animation.inColorFade && animTexts.buffer[i].text.letters[0].col[3] <= 0.6) {
                animTexts.buffer[i].animation.scaleFactor *= 1.002;
                if (animTexts.buffer[i].animation.scaleFactor >= 1.024) { // Smooth transition to the new scale value
                    animTexts.buffer[i].animation.scaleFactor = 1.024;
                }
                colorFactor = 0.99;
            }


            animTexts.buffer[i].text.letters[j].dim[0] *= animTexts.buffer[i].animation.scaleFactor;
            animTexts.buffer[i].text.letters[j].dim[1] *= animTexts.buffer[i].animation.scaleFactor;
            animTexts.buffer[i].text.letters[j].scale[0] *= animTexts.buffer[i].animation.scaleFactor;
            animTexts.buffer[i].text.letters[j].scale[1] *= animTexts.buffer[i].animation.scaleFactor;
            GlSetDim(animTexts.buffer[i].text.letters[j].gfxInfo, animTexts.buffer[i].text.letters[j].dim)

            // Correct the position of each letter to be centered to a given pos (the hit pos)
            accumTextWidth += animTexts.buffer[i].text.letters[j].dim[0];
            const posx = (animTexts.buffer[i].text.pos[0] - animTexts.buffer[i].text.dim[0]) + accumTextWidth;
            animTexts.buffer[i].text.letters[j].pos[1] -= animTexts.buffer[i].animation.yAdvance;
            GlSetWposXY(animTexts.buffer[i].text.letters[j].gfxInfo, [posx, animTexts.buffer[i].text.letters[j].pos[1]]);
            accumTextWidth += animTexts.buffer[i].text.letters[j].dim[0];

        }

        // Keep the position of the whole word centered when scaled.
        animTexts.buffer[i].text.dim[0] *= animTexts.buffer[i].animation.scaleFactor;

        // Update the factors to which the animation changes over time (basic non linear animation).
        animTexts.buffer[i].animation.yAdvance *= yFactor;
        animTexts.buffer[i].animation.colorDim *= colorFactor;
        ExplosionSimpleSetTranslation(animTexts.buffer[i].explosion.idx, -animTexts.buffer[i].animation.yAdvance);


        // Destroy animation and text when color has faded away
        if (animTexts.buffer[i].text.letters[0].col[0] <= 0.001) {
            animTexts.buffer[i].inAnimation = false;
            animTexts.buffer[i].isActive = false;
            return false;
        }
        return true;
    }

}
function AnimTextsStopAnimation() {

}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
