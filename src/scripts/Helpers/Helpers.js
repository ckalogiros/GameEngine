"use strict";
import { MapLinear, Max, Min, Pow } from "./Math/MathOperations.js";



export function DarkenColor(color, darkenAmt) {

    if (darkenAmt === 0)
        return color;

    let maxColorIdx = 0;
    if (color[1] > color[0] && color[1] > color[2])
        maxColorIdx = 1;
    else if (color[2] > color[0] && color[2] > color[1])
        maxColorIdx = 2;

    let darkerColor = [0, 0, 0, color[3]];
    for (let i = 0; i < color.length - 1; i++) {

        if (i !== maxColorIdx) {
            const ratio = color[maxColorIdx] / color[i];
            darkerColor[i] = color[i] - (darkenAmt / ratio);
        }
        else {
            darkerColor[maxColorIdx] = color[maxColorIdx] - darkenAmt;
        }

    }
    return darkerColor;
}

export function DimColor(col, dimAmt){
    return [col[0]*dimAmt, col[1]*dimAmt, col[2]*dimAmt, col[3]];
}

export function GetRandomColor(){
    return COLOR_ARRAY[GetRandomInt(0, COLOR_ARRAY.length)];
}

export function GetRandomPos(minPos, maxPos){
    const posx = GetRandomInt(minPos[0], maxPos[0]);
    const posy = GetRandomInt(minPos[1], maxPos[1]);
    return [posx, posy];
}

export function GetRandomInt(min, max) {
    return Math.floor((Math.random() * (max-min)) + min);
}

const SDF_PARAMS_VALS = {
    dimMin: 0,     // x1
    dimMax: 40,     // x2
    outerMin: 0.1,  // y1
    outerMax: 0.65,  // y2
}
export function CalculateSdfParamsFromFont(fontSize){
    let sdfVal = [0, 0];
    // Linear Interpolation
    sdfVal[0] = 0.5
    // sdfVal[0] = 
    //             (SDF_PARAMS_VALS.innerMin + (fontSize-SDF_PARAMS_VALS.fontSizeMin)
    //             // *((SDF_PARAMS_VALS.innerMax-SDF_PARAMS_VALS.innerMin)
    //             *((SDF_PARAMS_VALS.innerMax-SDF_PARAMS_VALS.innerMin)
    //             /(SDF_PARAMS_VALS.fontSizeMax-SDF_PARAMS_VALS.fontSizeMin)))/SDF_PARAMS_VALS.innerMax;
    //             // /(SDF_PARAMS_VALS.fontSizeMin-SDF_PARAMS_VALS.fontSizeMax));
    // sdfVal[1] = 0.3 
    sdfVal[1] = 1-
                (SDF_PARAMS_VALS.outerMin + (fontSize-SDF_PARAMS_VALS.fontSizeMin)
                *((SDF_PARAMS_VALS.outerMax-SDF_PARAMS_VALS.outerMin)
                /(SDF_PARAMS_VALS.fontSizeMax-SDF_PARAMS_VALS.fontSizeMin)))/SDF_PARAMS_VALS.outerMax;
    return sdfVal;
}


// export function CalculateSdfOuterFromDim(dim, maxDim){

//     // let sdfOuter = (((.5)/(90))*(90-dim));

//     const ratio = dim / 60;
//     const min = SDF_PARAMS_VALS.outerMin;
//     const max = SDF_PARAMS_VALS.outerMax;
//     //a + (b - a) * p
//     const sdfOuter = max - (min + (max - min) * ratio);


//     if(sdfOuter >= SDF_PARAMS_VALS.outerMax){
//         return SDF_PARAMS_VALS.outerMax
//     }else if(sdfOuter <= SDF_PARAMS_VALS.outerMin){
//         return SDF_PARAMS_VALS.outerMin
//     }
    
//     // console.log('sdf:', sdfOuter, 'dim:',dim, maxDim)
//     // console.log('Ratio:', ((.5/45)*(60-dim)))
//     return sdfOuter;
// }
export function CalculateSdfOuterFromDim(dim, maxDim){
    // b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 )
    const sdf = MapLinear(dim, 0, 120, .5, .1);
    // console.log(dim, sdf)
    return sdf;
    // return MapLinear(dim, 10, 90, .5, .1);

    // let sdfOuter = (((.5)/(90))*(90-dim));

    const ratio = dim / 60;
    const min = SDF_PARAMS_VALS.outerMin;
    const max = SDF_PARAMS_VALS.outerMax;
    //a + (b - a) * p
    const sdfOuter = max - (min + (max - min) * ratio);


    if(sdfOuter >= SDF_PARAMS_VALS.outerMax){
        return SDF_PARAMS_VALS.outerMax
    }else if(sdfOuter <= SDF_PARAMS_VALS.outerMin){
        return SDF_PARAMS_VALS.outerMin
    }
    
    // console.log('sdf:', sdfOuter, 'dim:',dim, maxDim)
    // console.log('Ratio:', ((.5/45)*(60-dim)))
    return sdfOuter;
}

// Returns the sign (-1,+1) out of any number
export function GetSign(val){
    return (2 * (val >> 31) + 1);
}

/**
 * Sorting na object based on property's value
 * 
    const obj = {
        james: 10,
        jane: 9,
        bob: 30
    }
 * 1. Stores only the sorted keys.
    const keysSorted = Object.keys(obj).sort(function(a,b){return obj[a]-obj[b]})
	console.log(keysSorted);
 
 * 2. Stores the sorted key-value pair.
    const sorted = Object.entries(obj)
        .sort(([, v1], [, v2]) => v1 - v2)
        .reduce((obj, [k, v]) => ({
            ...obj,
            [k]: v
    }), {})
    console.log(sorted)

 */