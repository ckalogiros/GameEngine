"use strict";

import { GlSetTex } from "../../../Graphics/Buffers/GlBufferOps.js";
import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { Rect2D } from "../Geometry/Rect2D.js";
import { CreateText } from "../Text/Text.js";

/**
 * The difference with plain text is that a label draws the text inside a rect mesh
 */
export class TextLabel {

    name = '';
    area = null; // Labels's rect area.
    text = null; // Labels's text faces.
    fontSize = 0;

    style = {
        pad: 0, // In pixels
        roundCorner: 0,
        border: 0,
        feather: 0,
    };

    constructor(sceneIdx, name, text, col, bkCol, dim, pos, style, fontSize, useSdfFont, sdfInner, Align) {
        this.name = name;
        this.style.pad = style.pad;
        this.style.roundCorner = style.roundCorner;
        this.style.border = style.border;
        this.style.feather = style.feather;
        this.fontSize = fontSize * Device.ratio;
        this.text = CreateText(text, col, dim, pos, style, this.fontSize, useSdfFont, sdfInner, Align);
        
        this.area = this.CreateArea(name + '-area', bkCol, this.text.dim, this.text.pos, this.text.faceWidth, style);
        this.area.gfxInfo = GlAddMesh(this.area.sid, this.area.mesh, 1, sceneIdx, 'button'+text, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
        for (let i = 0; i < this.text.letters.length; i++) {
            this.text.letters[i].gfxInfo = GlAddMesh(this.text.sid, this.text.letters[i], 1, sceneIdx, name, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
        }
        // Store the gfxInfo of one of the text faces (instead of accessing 'xxx.text.letters[x].gfxInfo')
        this.text.gfxInfo = this.text.letters[0].gfxInfo;
    }

    CreateArea(name, col, dim, pos, charWidth, style) {
        // Create the buttons area(based on text dimentions and position)
        const areaWpos = pos;
        areaWpos[0] += dim[0];

        // Add padding
        const padding = style.pad * 2;
        dim[0] += padding;
        dim[1] += padding;

        const area = new Rect(name, SID_DEFAULT | SID.DEF2, col, dim, [1, 1], null, areaWpos, style, null, null);

        area.defDim = area.dim; // Keep a duplicate of the first assigned dimention.
        area.defWpos = area.pos; // Keep a duplicate of the first assigned position.

        return area;
    }

    ChangeText(newText) {
        this.name = newText;

        const newlen = newText.length;
        const totallen = this.text.len;
        const spaceCharUvs = FontGetUvCoords(' ');

        for (let i = 0; i < totallen; i++) {
            if(i < newlen){
                const uvs = FontGetUvCoords(newText[i]);
                GlSetTex(this.text.letters[i].gfxInfo, uvs);
                this.text.letters[i].tex = uvs;
            }
            else{ // Set remaining characters to empty(space char)
                GlSetTex(this.text.letters[i].gfxInfo, spaceCharUvs);
                this.text.letters[i].tex = spaceCharUvs;
            }
        }
    }
    
    GetGfxIdx(){
        /** Get all widget's progs and vertexBuffer indexes */
        const gfxIdx = [
            [this.text.gfxInfo.prog.idx, this.text.gfxInfo.vb.idx],
            [this.area.gfxInfo.prog.idx, this.area.gfxInfo.vb.idx],
        ];
        return gfxIdx;
    }
}