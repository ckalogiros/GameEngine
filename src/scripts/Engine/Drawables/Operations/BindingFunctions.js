"use strict";

import { MapLinear } from "../../../Helpers/Math/MathOperations.js";


export function Bind_change_color_rgb(target, val, maxval){

   if(target === undefined) alert('Target should not be undefined. @ BindingFunctions.js Bind_change_color_rgb().');

   const rgbval = MapLinear( val, 0, maxval, 0, 1 );
   console.log(rgbval)

   target.SetColorRGB([rgbval, rgbval, rgbval]);
}
export function Bind_change_brightness(target, val, maxval){

   if(target === undefined) alert('Target should not be undefined. @ BindingFunctions.js Bind_change_color_rgb().');

   const rgbval = MapLinear( val, 0, maxval, 0.3, 1.8 );
   
   const col = target.mat.defCol;
   const r = (rgbval * col[0] < 0) ? 0 : ((rgbval * col[0] > 1) ? 1 : rgbval * col[0])
   const g = (rgbval * col[1] < 0) ? 0 : ((rgbval * col[1] > 1) ? 1 : rgbval * col[1])
   const b = (rgbval * col[2] < 0) ? 0 : ((rgbval * col[2] > 1) ? 1 : rgbval * col[2])
   // console.log([r, g, b])

   target.SetColorRGB([r, g, b]);
}

export function Bind_change_pos_x(target, val, maxval){

   if(target === undefined) alert('Target should not be undefined. @ BindingFunctions.js Bind_change_color_rgb().');

   const x = MapLinear( val, 0, maxval, 0, Viewport.right );
   // console.log(x)

   target.SetPosX(x);
}