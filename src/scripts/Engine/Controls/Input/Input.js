
"use strict";


import { OnMouseMove_Android, OnTouchStart, OnTouchEnd, OnTouchCancel, OnTouchMove } from "../../Events/MouseEvents.js";
import { OnMouseMove, OnMouseDown, OnMouseUp, OnMouseOut, OnMouseWheel } from "./Mouse.js";
import { OnKeyDown, OnKeyUp } from "./Keys.js";




export function Input_create_user_input_listeners() {

   if (PLATFORM.ANDROID_IMPL) {

       document.addEventListener('mousemove', OnMouseMove_Android, false);
       // Touch screen events
       document.addEventListener("touchstart", OnTouchStart);
       document.addEventListener("touchend", OnTouchEnd);
       document.addEventListener("touchcancel", OnTouchCancel);
       document.addEventListener("touchmove", OnTouchMove);
   }
   else {

       document.addEventListener('mousemove', OnMouseMove, false);
       document.addEventListener('mouseout', OnMouseOut, false);
       document.addEventListener('wheel', OnMouseWheel, false);
   }

   document.addEventListener('mousedown', OnMouseDown, false);
   document.addEventListener('mouseup', OnMouseUp, false);
   document.addEventListener("resize", OnWindowResize, false);

   // Disabling the context menu on long taps on Android. 
   document.oncontextmenu = function (event) {

       event.preventDefault();
       event.stopPropagation();
       return false;
   };

   document.addEventListener('keydown', OnKeyDown, false);
   document.addEventListener('keyup', OnKeyUp, false);

}



function OnWindowResize() {
   console.debug('WINDOW RESIZE')
}