"use strict";

import { GetSign } from "../../../Helpers/Helpers.js";
import { Floor } from "../../../Helpers/Math/MathOperations.js";
import { RegisterEvent } from "../../Events/Events.js";


const mouse = {

   /**
    * Why setting prev pos to INT_NULL:
    *    If the mouse leaves the 'html-body', the mouse.pos.prev stores the mouse pos, as it ought to do.
    *    Now if the mouse enters from a different x-y coordinate, then the xdiff is calculated as pos - prevPos,
    *    which takes into account the coordinates before the mouse leaved the 'html-body'.
    *    This produces huge ammounts of difference. To avoid that, whenever the mouse leaves the 'html-body' area,
    *    we set the prevPos to INT_NULL, so that uppon OnMouseMove() callback we check if the value is NOT INT_NULL 
    *    in order to procceed and do the dif calculation. If it is INT_NULL (means that mouse left the area), then we
    *    just store the new pos in the prevPos variable. 
    */

   pos: {
      x: 0, y: 0,
      xprev: INT_NULL, yprev: INT_NULL, // Mouse previous pos
      xdiff: 0, ydiff: 0, // Mouse pos difference form previous pos (in pixels)

      GetPos(){
         return [
            this.x,
            this.y,
         ];
      },
      GetDif(){
         return {
            x:Floor(this.xdiff),
            y:Floor(this.ydiff),
         };
      },
      GetPrevPos(){
         return {
            x:this.xprev,
            y:this.yprev,
         };
      },
      SetPos(x, y){
         this.x = x;
         this.y = y;
      },
      SetDif(x, y){
         this.xdiff = x;
         this.ydiff = y;
      },
      SetPrevPos(x, y){
         this.xprev = x;
         this.yprev = y;
      },
      ResetPos(){
         this.x = 0;
         this.y = 0;
      },
      ResetDif(){
         this.xdiff = 0;
         this.ydiff = 0;
      },
      DampenDif(factor){
         this.xdiff *= factor;
         this.ydiff *= factor;
      },
      ResetPrevPos(){
         this.xprev = 0;
         this.yprev = 0;
      },
   },
   click: {
      down:{
         btn: INT_NULL,   // Mouse Buttons. 0:Left, 1:Middle, 2:Right.
         x: 0, y: 0,
         xprev: 0, yprev: 0, // Mouse previous pos
         Set(btn){
            this.btn = btn;
            this.xprev = this.x;
            this.yprev = this.y;
            this.x =  mouse.pos.x;
            this.y =  mouse.pos.y;
            // console.log(this)
         }
      },
      up:{
         btn: INT_NULL,   // Mouse Buttons. 0:Left, 1:Middle, 2:Right.
         x: 0, y: 0,
         xprev: 0, yprev: 0, // Mouse previous pos
         Set(btn){
            this.btn = btn;
            this.xprev = this.x;
            this.yprev = this.y;
            this.x =  mouse.pos.x;
            this.y =  mouse.pos.y;
            // console.log(this)
         }
      },
      drag: {
         x:0,
         y:0,
         Area(){
            this.x = mouse.click.up.x - mouse.click.down.x;
            this.y = mouse.click.up.y - mouse.click.down.y;
            // console.log(this);
         }
      },
   },
   wheel: {
      x:0, // The mouse position at the time of the wheel scroll
      y:0, // The mouse position at the time of the wheel scroll
      delta: 0, // The - of the delta value is for scrolling up, the + is for down.
      Reset(){
         this.delta = 0;
      }
   }

   
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Getters-Setters 
 */

/**
 * 
 * @returns {Obj:{x,y}} 
 */
export function MouseGetPos() {
   return mouse.pos.GetPos();
}
export function MouseGetPosDif() {
   return mouse.pos.GetDif();
}
export function MouseGetDir() {

   return mouse.pos.GetDif();
}
export function MouseGetXdir() {
   return mouse.pos.xdiff;
}
export function MouseGetYdir() {
   return mouse.pos.ydiff;
}
export function MouseResetDif(factor) {
   mouse.pos.DampenDif(factor)
}
export function MouseGetWheel(){
   return mouse.wheel;
}
export function MouseResetWheel(){
   mouse.wheel.Reset();
}


/**
 * Mouse Events
 */
export function OnMouseMove(e) {

   e.stopPropagation();
   e.preventDefault(); 

   const newPosX = e.clientX - Viewport.leftMargin;
   const newPosY = e.clientY + Viewport.topMargin;
   const oldPosx = mouse.pos.x;
   const oldPosy = mouse.pos.y;
      
   mouse.pos.x = newPosX;
   mouse.pos.y = newPosY;

   if(mouse.pos.xprev !== INT_NULL){
      mouse.pos.xprev = oldPosx;
      mouse.pos.yprev = oldPosy;
   }
   else{
      mouse.pos.xprev = newPosX;
      mouse.pos.yprev = newPosY;
   }

   // mouse.pos.xdiff = Floor(mouse.pos.x - mouse.pos.xprev);
   // mouse.pos.ydiff = -Floor((mouse.pos.y - mouse.pos.yprev)); // Reverse the direction(negative for down dir and positive for up dir) 
   mouse.pos.xdiff = (mouse.pos.x - mouse.pos.xprev);
   mouse.pos.ydiff = -((mouse.pos.y - mouse.pos.yprev)); // Reverse the direction(negative for down dir and positive for up dir) 
   // const params = {
   //    mouseButton: e.which-1
   // };
   RegisterEvent('mouse-move', null);
}

export function OnMouseOut(e){
   
   e.stopPropagation();
   e.preventDefault();

   mouse.pos.SetPrevPos(INT_NULL, INT_NULL);
   mouse.pos.ResetPos();
}

export function OnMouseWheel(e){

   e.stopPropagation();
   e.preventDefault();

   // client.x-y, the mouse pos at the time of the wheel scroll 
   // wheelDelta for the sign (- wheel down, + wheel up) and the value probablyy represents the wheel move in pixels
   mouse.wheel.x = e.clientX;
   mouse.wheel.x =  e.clientY;
   mouse.wheel.delta = GetSign(e.wheelDelta);

   // console.log(`MOUSE WHEEL: pos: ${e.x} ${e.y}, delta: ${e.wheelDelta}`)
}

export function OnMouseDown(e) {
   
   e.stopPropagation();
   e.preventDefault(); 
   
   mouse.click.down.Set(e.which-1);
   
   const params = {
      mouseButton: e.which-1
   };
   
   RegisterEvent('mouse-click-down', params);
   // console.log(`MOUSE pos: ${e.x} ${e.y}`)
}

export function OnMouseUp(e) {
   
   e.stopPropagation();
   e.preventDefault(); 
   
   mouse.click.up.Set(e.which-1)
   mouse.click.drag.Area();
   
   const params = {
      mouseButton: e.which-1
   };
   RegisterEvent('mouse-click-up', params)
}