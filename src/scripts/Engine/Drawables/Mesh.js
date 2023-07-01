"use strict";
import * as math from "../../Helpers/Math/MathOperations.js"

/**
 * A structure to reflect a mesh's data to be inserted in the vertex buffer
 */
export class Mesh {

    col = [0, 0, 0, 0];
    dim = [0, 0];
    scale = [0, 0];
    tex = [0, 0, 0, 0];
    pos = [0, 0, 0];
    style = [0, 0, 0];
    time = 0.0;
    sdfParams = [0, 0]
    defDim = [0, 0]
    defScale = [0, 0]
    defPos = [0, 0, 0];
    attrParams1 = [0, 0, 0, 0]

    constructor(col, dim, scale, tex, pos, style, time, attrParams1, sdfParams) {
        math.CopyArr4(this.col, col);
        math.CopyArr2(this.dim, dim);
        math.CopyArr2(this.scale, scale);

        if (tex) { math.CopyArr4(this.tex, tex); }

        math.CopyArr3(this.pos, pos);

        if (style) {
            this.style[0] = style.roundCorner;
            this.style[1] = style.border;
            this.style[2] = style.feather;
        }
        
        if(time) this.time = time;
        if(sdfParams) math.CopyArr2(this.sdfParams, sdfParams);

        if(attrParams1){ // TODO: Better to create an array of length of the input param length 
            let i = 0;
            while(attrParams1[i]){
                this.attrParams1[i] = attrParams1[i];
                i++;
            }
        }

        // Keep a copy of the starting dimention and position
        math.CopyArr2(this.defDim, dim);
        math.CopyArr2(this.defScale, scale);
        math.CopyArr3(this.defPos, pos);
    }
}


