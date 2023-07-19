"use strict";


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Multiply Array */
export function MulArr4Val(arr, val){
    arr[0] *= val;
    arr[1] *= val;
    arr[2] *= val;
    arr[3] *= val;
}
export function Pow(base, exp){
    let res = base;
    while(exp){
        res *= base;
        exp--;
    }
    return res;
}




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Set Array */
// TODO: dst and src are logicaly opposite, swap them
export function CopyArr(dst, src){
    
    if(!src || src === undefined){
        console.error('src is null. @ MathOperations.js');
        return null;
    }
    
    const len = src.length;
    let out = new Array(len);

    if(Array.isArray(src[0])){

        const len2 = src[0].length;
        
        for(let i=0; i<len; i++){
            out[i] = new Array(len2);
            for(let j=0; j<len2; j++){
                out[i][j] = src[i][j]
            }
        }
    }
    else{
        for(let i=0; i<len; i++){
            out[i] = src[i]
        }
    }
    
    dst = out;
    return dst;
}
export function CopyArr4(dst, src){
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
    dst[3] = src[3];
}
export function CopyArr3(dst, src){
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
}
export function CopyArr2(dst, src){
    dst[0] = src[0];
    dst[1] = src[1];
}
export function CopyArr1(dst, src){
    dst[0] = src[0];
}
export function SetArrElem(dst, src, idx){
    dst[idx] = src[idx];
}
export function CopyArr1_4(dst, val){
    dst[0] = val;
    dst[1] = val;
    dst[2] = val;
    dst[3] = val;
}
export function CopyArr1_3(dst, val){
    dst[0] = val;
    dst[1] = val;
    dst[2] = val;
}
export function CopyArr1_2(dst, val){
    dst[0] = val;
    dst[1] = val;
}

export function AddArr2(arr1, arr2){
    return [
        arr1[0]+arr2[0],
        arr1[1]+arr2[1],
    ];
}


export function Abs(a){
    return a > 0 ? a : -a;
}
export function Max(val1, val2) {
    return val1 > val2 ? val1 : val2;
}
export function Min(val1, val2) {
    return val1 < val2 ? val1 : val2;
}
export function Max3(val1, val2, val3) {
    return val1 > val2 ? Max(val1, val3) : Max(val2, val3);
}
export function Min3(val1, val2, val3) {
    return val1 < val2 ? Min(val1, val3) : Min(val2, val3);
}

export function InterpolateToRange(value, resolution, maxVal) {

    const res = maxVal / resolution;
    // console.log('res:', res);
    const interpolatedVal = value * res;
    return interpolatedVal;
}

export function InterpolateToRange01Inverted(value) {
    return 1/value;
}
export function InterpolateToRange01(value, max) {
    return (1.0/max) * value;
}


export function Hash11(seed){
    let x = Math.sin(seed*19287.8873)*28715.715; 
    return (x-Math.floor(x));
}

// export function Clamp(val, lLimit, uLimit){
//     return val <lLimit ? lLimit : (val > uLimit ? uLimit : val) 
// }

export function Clamp(val, min, max) {
    const v = val < min ? min : val;
    return v > max ? max : v;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Linear mapping from range <a1, a2> to range <b1, b2>
export function MapLinear( x, a1, a2, b1, b2 ) {

	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

}


// https://en.wikipedia.org/wiki/Linear_interpolation
export function Lerp( x, y, t ) {

	return ( 1 - t ) * x + t * y;

}

// http://en.wikipedia.org/wiki/Smoothstep
export function Smoothstep( x, min, max ) {

	if ( x <= min ) return 0;
	if ( x >= max ) return 1;
	x = ( x - min ) / ( max - min );

	return x * x * ( 3 - 2 * x );

}

export function Smootherstep( x, min, max ) {

	if ( x <= min ) return 0;
	if ( x >= max ) return 1;

	x = ( x - min ) / ( max - min );

	return x * x * x * ( x * ( x * 6 - 15 ) + 10 );

}
