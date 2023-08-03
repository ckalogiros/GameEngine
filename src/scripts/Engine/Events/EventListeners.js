"use strict";

import { Collision_PointRect } from "../Collisions.js";
import { MouseGetMousePos } from "../Controls/Input/Mouse.js";



class Listener {

   clbk;
   params;

   constructor(clbk, params) {
      this.clbk = clbk;
      this.params = params;
   }
}


export class EventListener {

   has = false;
   type = ''; // TODO: Make type integer bit-mask 
   buffer;
   count;
   size;

   constructor(size, type) {

      this.buffer = [];
      for (let i = 0; i < size; i++) {
         this.buffer[i] = new Listener(null, {});
      }

      this.size = size;
      this.count = 0;
      this.type = type;
      this.has = false;

   }

   Add(clbk, params) {

      if (!this.buffer || this.count >= this.size) {
         console.error('EventListener\'s buffer is uninitialized Or buffer overflow')
         return;
      }
      const idx = this.count++;
      this.buffer[idx].clbk = clbk;
      this.buffer[idx].params = params;
      this.has = true;
      return idx;
   }

   Call() {
      this.buffer[0].clbk(this.buffer[0].params);
   }

   Realloc() {

      this.size *= 2;
      const oldData = this.data;
      this.data = new Array(this.size);
      this.CopyBuffer(oldData)
      console.warn('Resizing M_Buffer!')
   }

   #CopyBuffer(oldData) {

      const size = oldData.length;
      for (let i = 0; i < size; i++) {
         this.data[i] = oldData[i];
      }
   }

}

/**
 * All Event Listener callback functions
 */

export function CheckHover(params) {

   const rect = [
      // Left  Right 
      [params.pos[0] - params.dim[0], params.pos[0] + params.dim[0],],
      // Top  Bottom
      [params.pos[1] - params.dim[1], params.pos[1] + params.dim[1],],
   ];
   const mousePos = MouseGetMousePos();
   const point = [
      mousePos.x,
      mousePos.y,
   ];
   return Collision_PointRect(point, rect);
}