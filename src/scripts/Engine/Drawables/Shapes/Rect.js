"use strict";
import * as math from '../../../Helpers/Math/MathOperations.js'
import { GlSetColor, GlSetWposXY, GlSetDim, GlSetColorAlpha, GlSetScale, GlScale, GlSetWposX, GlSetAttrRoundCorner, GlMove, GlSetWposY, GlSetAttrTex, GlSetAttrTime, GlSetAttrParams1 } from "../../../Graphics/GlBufferOps.js";
import { DimColor } from "../../../Helpers/Helpers.js";
import { Max3 } from "../../../Helpers/Math/MathOperations.js";
import { Mesh } from "../Mesh.js";
import { AtlasTextureGetCoords } from '../../Loaders/Textures/Texture.js';
import { GlSetWposZ } from '../../../Graphics/GlBufferOps.js';
import { TimerGetGlobalTimer } from '../../Timer/Timer.js';


export class Rect {

    sid; // Shader Type Id
    mesh; // Meshe's attributes
    gfxInfo; // Graphics Info
    defScale = [1, 1];
    isActive;Ks

    // For debuging
    name = '';
    
    constructor(name, sid, col, dim, scale, tex, pos, style, time, attrParams1) {
        this.name = name;
        this.sid = sid ;
        this.mesh = new Mesh(col, dim, scale, tex, pos, style, time, attrParams1, null);
        this.gfxInfo = null; // Graphics Info
        this.isActive = false; 
        math.CopyArr2(this.defScale, scale);
    }

    /**
     * @param {float} minCol: The min value that the color should transition
     *                      The min value is checked based on the MAX(r, g, b)
     * @param {float} amt: the ammount of color dim. 
     *                  Should be a value of range [0.0, 1.0]
     *                  The higher the value, the slower the transition 
     * @returns {bool} True: Animation not finished. False: Animation is finished.
     */
    // Stops dimming the color below a 'minCol' threshold
    DimColor(minCol, amt) {
        const col = DimColor(this.mesh.col, amt);
        const max = Max3(col[0], col[1], col[2])
        if (max > minCol) {
            GlSetColor(this.gfxInfo, col);
            this.mesh.col = col;
            return true;
        }
        return false;
    }
    DimColor2(amt) {
        const col = DimColor(this.mesh.col, amt);
        GlSetColor(this.gfxInfo, col);
        this.mesh.col = col;
        return true;
    }
    SetColor(col) {
        math.CopyArr4(this.mesh.col, col);
        GlSetColor(this.gfxInfo, col);
    }
    SetColorAlpha(a) {
        this.mesh.col[3] = a;
        GlSetColorAlpha(this.gfxInfo, a);
    }
    SetPos(pos) {
        math.CopyArr2(this.mesh.pos, pos);
        GlSetWposXY(this.gfxInfo, pos);
    }
    UpdatePosXY() {
        GlSetWposXY(this.gfxInfo, this.mesh.pos);
    }
    SetPosXY(pos) {
        math.CopyArr2(this.mesh.pos, pos);
        GlSetWposXY(this.gfxInfo, pos);
    }
    SetPosX(x) {
        this.mesh.pos[0] = x;
        GlSetWposX(this.gfxInfo, x);
    }
    SetPosY(y) {
        this.mesh.pos[1] = y;
        GlSetWposY(this.gfxInfo, y);
    }
    SetZindex(z) {
        this.mesh.pos[2] = z;
        GlSetWposZ(this.gfxInfo, z);
    }
    Move(x, y) {
        this.mesh.pos[0] += x;
        this.mesh.pos[1] += y;
        GlMove(this.gfxInfo, [x, y]);
    }
    MoveX(x) {
        this.mesh.pos[0] += x;
        GlMove(this.gfxInfo, [x, 0]);
    }
    MoveY(y) {
        this.mesh.pos[1] += y;
        GlMove(this.gfxInfo, [0, y]);
    }
    SetDim(dim) {
        math.CopyArr2(this.mesh.dim, dim);
        GlSetDim(this.gfxInfo, dim);
    }
    Shrink(val) {
        this.mesh.dim[0] *= val;
        this.mesh.dim[1] *= val;
        GlSetDim(this.gfxInfo, this.mesh.dim);
    }
    SetColorAlpha(alpha) {
        this.mesh.col[3] = alpha;
        GlSetColorAlpha(this.gfxInfo, alpha);
    }
    UpdateScale() {
        GlSetScale(this.gfxInfo, this.mesh.scale);
    }
    SetScale(s) {
        this.mesh.scale[0] *= s;
        this.mesh.scale[1] *= s;
        GlSetScale(this.gfxInfo, this.mesh.scale);
    }
    ScaleFromVal(val) {
        this.mesh.scale[0] *= val;
        this.mesh.scale[1] *= val;
        GlSetScale(this.gfxInfo, this.mesh.scale);
        // Also set dim to mirror the scale
        this.mesh.dim[0] *= val;
        this.mesh.dim[1] *= val;
    }
    SetRoundCorner(roundnes) {
        this.mesh.style[0] = roundnes;
        GlSetAttrRoundCorner(this.gfxInfo, roundnes);
    }
    StoreDefPos(pos) {
        math.CopyArr2(this.mesh.defPos, pos);
    }
    SetTexture(texName){
        const texCoord = AtlasTextureGetCoords(texName);
        GlSetAttrTex(this.gfxInfo, texCoord);
    }
    // TODO: Some Drawables(e.x. Glow) have an extra timer variable in their class. Use the time variable from the Mesh class of the drawable. 
    SetGlobalTimeAttr(){ // Sets the attribute time from the global timer, and updates the mesh timer.
        this.mesh.time = TimerGetGlobalTimer();
        GlSetAttrTime(this.gfxInfo, this.mesh.time);
    }
    SetTimeAttr(t){ // Sets the attribute time from param t, and updates the mesh timer.
        this.mesh.time = t;
        GlSetAttrTime(this.gfxInfo, this.mesh.time);
    }
    UpdateTimeAttr(){ // Sets the attribute time from timer in the mesh object
        GlSetAttrTime(this.gfxInfo, this.mesh.time);
    }
    SetParams1Attr(paramOffset, val){
        this.mesh.attrParams1[paramOffset] = val;
        GlSetAttrParams1(this.gfxInfo, this.mesh.attrParams1, paramOffset);
    }
    UpdateParams1Attr(paramOffset){
        GlSetAttrParams1(this.gfxInfo, this.mesh.attrParams1, paramOffset);
    }
    SetStyle_RoundCorner(roundness){
        GlSetAttrRoundCorner(this.gfxInfo, roundness);
    }

    GetGfxIdx(){
        /** Get rect's prog and vertexBuffer indexes */
        const gfxIdx = [
            [this.gfxInfo.prog.idx, this.gfxInfo.vb.idx],
        ];
        return gfxIdx;
    }
}

export function RectCreateRect(name, sid, col, dim, scale, tex, pos, style, time, attrParams1) {
    return new Rect(name, sid, col, dim, scale, tex, pos, style, time, attrParams1);
}