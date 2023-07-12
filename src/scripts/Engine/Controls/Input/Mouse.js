"use strict";


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

   out: false,

   pos: {
      x: 0, y: 0,
      xprev: INT_NULL, yprev: INT_NULL, // Mouse previous pos
      xdiff: 0, ydiff: 0, // Mouse pos difference form previous pos (in pixels)

      GetPos(){
         return {
            x:this.x,
            y:this.y,
         };
      },
      GetDif(){
         return {
            x:this.xdiff,
            y:this.ydiff,
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
         // xdiff: 0, ydiff: 0, // Mouse click difference form previous click (in pixels)
         Set(btn){
            this.btn = btn;
            this.xprev = mouse.pos.xprev;
            this.yprev = mouse.pos.yprev;
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
            this.xprev = mouse.pos.xprev;
            this.yprev = mouse.pos.yprev;
            this.x =  mouse.pos.x;
            this.y =  mouse.pos.y;
            // console.log(this)
         }
         // xdiff: 0, ydiff: 0, // Mouse click difference form previous click (in pixels)
      },
      drag: {
         x:0,
         y:0,
         Area(){
            this.x = mouse.click.up.x - mouse.click.down.x;
            this.y = mouse.click.up.y - mouse.click.down.y;
            console.log(this);
         }
      },
   },

   
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Getters-Setters */
export function MouseGetMousePos() {
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
   // mouse.pos.ResetDif()
   mouse.pos.DampenDif(factor)
}

/**
 * Mouse Event Listeners
 */
export function OnMouseMove(e) {

   e.stopPropagation();
   e.preventDefault(); 

   // if(!mouse.out){
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

   
      mouse.pos.xdiff = mouse.pos.x - mouse.pos.xprev;
      mouse.pos.ydiff = -(mouse.pos.y - mouse.pos.yprev); // Reverse the direction(negative for down dir and positive for up dir) 
      // console.log(mouse.pos.GetDif())
   // }

}
export function OnMouseOut(e){
   
   e.stopPropagation();
   e.preventDefault();

   // mouseout { target: img#TextureAtlas, buttons: 0, clientX: 63, clientY: 463, layerX: 5, layerY: 463 }
   console.log(e)
   // if(e.mouseout.target && !mouse.out)
   //    mouse.out = false;

   mouse.pos.SetPrevPos(INT_NULL, INT_NULL);
   mouse.pos.ResetPos();
   // mouse.out = true;

   console.log('MOUSE OUT !!!!!!')
}
export function OnMouseWheell(e){

   e.stopPropagation();
   e.preventDefault();

   console.log('MOUSE WHEEL !!!!!!')
}
export function OnMouseDown(e) {

   e.stopPropagation();
   e.preventDefault(); 

   mouse.click.down.Set(e.which-1);
}
export function OnMouseUp(e) {
   
   e.stopPropagation();
   e.preventDefault(); 
   
   mouse.click.up.Set(e.which-1)
   mouse.click.drag.Area();
}