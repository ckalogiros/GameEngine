"use strict";

import { GlSetTex } from "../../../Graphics/Buffers/GlBufferOps.js";
import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { Geometry2D } from "../Geometry.js";
import { Rect2D } from "../Geometry/Rect2D.js";
import { TextGeometry2D } from "../Geometry/TextGeometry.js";
import { FontMaterial, Material } from "../Material.js";
import { Mesh, TextMesh } from "../Mesh.js";
import { CreateText } from "../Text/Text.js";

/**
 * The difference with plain text is that a label draws the text inside a rect mesh
 */
export class TextLabel{

    areaMesh = null; 
    textMesh = null; 

    constructor(text, pos, fontSize, scale=[1,1] ) {
        
        const textgeom = new TextGeometry2D(pos, fontSize, scale, text, FONTS.SDF_CONSOLAS_LARGE);
        const textmat  = new FontMaterial(PINK_240_60_160, FONTS.SDF_CONSOLAS_LARGE, text, [.3, .4])
        pos[2] -= 1;
        const pad = 3;
        const areaMetrics = this.CalculateArea(text, textgeom.dim, textgeom.pos, pad)
        const areageom = new Geometry2D(areaMetrics.pos, areaMetrics.dim, scale, text);
        const areamat  = new Material(GREY5)
        
        textgeom.pos[0] += pad*2; // In essence we set as the left (start of text label) the label area and not the left of text.

        this.textMesh  = new TextMesh(textgeom, textmat);
        this.areaMesh  = new Mesh(areageom, areamat);
        
    }

    CalculateArea(text, _dim, pos, pad) {

        const textLen = text.length;
        const dim = [_dim[0]*textLen, _dim[1]];

        // const padding = 10;
        const areaWpos = [pos[0], pos[1], pos[2]];
        areaWpos[0] -= _dim[0]+pad; // Subtract half face
        areaWpos[0] += pad; // Subtract half face
        
        dim[0] += pad*2; // Padd height
        dim[1] += pad*2; // Padd width

        areaWpos[0] += dim[0]; // center the area arround text


        return {
            dim:dim,
            pos:areaWpos,
        };
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
            [this.label.gfxInfo.prog.idx, this.label.gfxInfo.vb.idx],
        ];
        return gfxIdx;
    }
}

/** Old */
// export class TextLabel {

//     name = '';
//     label = null; // Labels's rect label.
//     text = null; // Labels's text faces.
//     fontSize = 0;

//     style = {
//         pad: 0, // In pixels
//         roundCorner: 0,
//         border: 0,
//         feather: 0,
//     };

//     constructor(sceneIdx, name, text, col, bkCol, dim, pos, style, fontSize, useSdfFont, sdfInner, Align) {
//         this.name = name;
//         this.style.pad = style.pad;
//         this.style.roundCorner = style.roundCorner;
//         this.style.border = style.border;
//         this.style.feather = style.feather;
//         this.fontSize = fontSize * Device.ratio;
//         this.text = CreateText(text, col, dim, pos, style, this.fontSize, useSdfFont, sdfInner, Align);
        
//         this.label = this.CreateArea(name + '-label', bkCol, this.text.dim, this.text.pos, this.text.faceWidth, style);
//         this.label.gfxInfo = GlAddMesh(this.label.sid, this.label.mesh, 1, sceneIdx, 'button'+text, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
//         for (let i = 0; i < this.text.letters.length; i++) {
//             this.text.letters[i].gfxInfo = GlAddMesh(this.text.sid, this.text.letters[i], 1, sceneIdx, name, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
//         }
//         // Store the gfxInfo of one of the text faces (instead of accessing 'xxx.text.letters[x].gfxInfo')
//         this.text.gfxInfo = this.text.letters[0].gfxInfo;
//     }

//     CreateArea(name, col, dim, pos, charWidth, style) {
//         // Create the buttons label(based on text dimentions and position)
//         const areaWpos = pos;
//         areaWpos[0] += dim[0];

//         // Add padding
//         const padding = style.pad * 2;
//         dim[0] += padding;
//         dim[1] += padding;

//         const label = new Rect(name, SID_DEFAULT | SID.DEF2, col, dim, [1, 1], null, areaWpos, style, null, null);

//         label.defDim = label.dim; // Keep a duplicate of the first assigned dimention.
//         label.defWpos = label.pos; // Keep a duplicate of the first assigned position.

//         return label;
//     }

//     ChangeText(newText) {
//         this.name = newText;

//         const newlen = newText.length;
//         const totallen = this.text.len;
//         const spaceCharUvs = FontGetUvCoords(' ');

//         for (let i = 0; i < totallen; i++) {
//             if(i < newlen){
//                 const uvs = FontGetUvCoords(newText[i]);
//                 GlSetTex(this.text.letters[i].gfxInfo, uvs);
//                 this.text.letters[i].tex = uvs;
//             }
//             else{ // Set remaining characters to empty(space char)
//                 GlSetTex(this.text.letters[i].gfxInfo, spaceCharUvs);
//                 this.text.letters[i].tex = spaceCharUvs;
//             }
//         }
//     }
    
//     GetGfxIdx(){
//         /** Get all widget's progs and vertexBuffer indexes */
//         const gfxIdx = [
//             [this.text.gfxInfo.prog.idx, this.text.gfxInfo.vb.idx],
//             [this.label.gfxInfo.prog.idx, this.label.gfxInfo.vb.idx],
//         ];
//         return gfxIdx;
//     }
// }