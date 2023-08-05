"use strict";

import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { Geometry2D_Text } from "../Geometry/Geometry2DText.js";
import { FontMaterial, Material } from "../Material/Material.js";
import { MESH_ENABLE, Mesh, Text_Mesh } from "../Mesh.js";



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
export class Widget_Text_Label extends Mesh {

    type = 0;
    pad = 0;

    constructor(text, pos, fontSize, scale = [1, 1], pad = 0, bold = .4) {

        const sdfouter = CalculateSdfOuterFromDim(fontSize);
        const textmat = new FontMaterial(WHITE, FONTS.SDF_CONSOLAS_LARGE, text, [bold, sdfouter])
        const textgeom = new Geometry2D_Text(pos, fontSize, scale, text, FONTS.SDF_CONSOLAS_LARGE);
        pos[2] -= 1; // Set z-axis, render text in front of area

        const areaMetrics = CalculateArea(text, textgeom.dim, pos, pad)
        const areageom = new Geometry2D(areaMetrics.pos, areaMetrics.dim, scale, text);
        const areamat = new Material(BLUE_10_160_220)

        super(areageom, areamat);

        textgeom.pos[0] += pad * 2; // In essence we set as the left (start of text label) the label area and not the left of text.

        this.Enable(MESH_ENABLE.ATTR_STYLE);
        this.SetStyle(6, 8, 3);

        const textMesh = new Text_Mesh(textgeom, textmat);
        this.AddChild(textMesh);

        this.type |= MESH_TYPES.TEXT_LABEL;
        this.type |= textgeom.type;
        this.type |= textmat.type;
        this.type |= areageom.type;
        this.type |= areamat.type;
        console.log(GetMeshType(this.type))

        this.pad = pad;
    }


    // ChangeText(newText) {
    //     // this.name = newText;

    //     // const newlen = newText.length;
    //     // const totallen = this.text.len;
    //     // const spaceCharUvs = FontGetUvCoords(' ');

    //     // for (let i = 0; i < totallen; i++) {
    //     //     if (i < newlen) {
    //     //         const uvs = FontGetUvCoords(newText[i]);
    //     //         GlSetTex(this.text.letters[i].gfxInfo, uvs);
    //     //         this.text.letters[i].tex = uvs;
    //     //     }
    //     //     else { // Set remaining characters to empty(space char)
    //     //         GlSetTex(this.text.letters[i].gfxInfo, spaceCharUvs);
    //     //         this.text.letters[i].tex = spaceCharUvs;
    //     //     }
    //     // }
    // }

    //////////////////////////////////////////////////////////////

    AddToGraphicsBuffer(sceneIdx) {

        const gfx = []
        for (let i = 0; i < this.children.count; i++) {
            gfx[i + 1] = this.children.buffer[i].AddToGraphicsBuffer(sceneIdx);
        }
        gfx[0] = super.AddToGraphicsBuffer(sceneIdx);

        return gfx;

    }

    Listener_listen_mouse_hover() {
        this.geom.Listener_listen_mouse_hover();
    }

}

