"use strict";

import { MouseGetPosDif } from "./Input/Mouse";

/**
 * Contols-Input is set via a callback function or an object
 * to eliminate any conditional code in the hot path of the render.
 */


class Controller {

   controls;
   target;

   constructor(target) {
      this.target = target;
   }

   Update() {
      this.controls.Update();
   }

}
export class OrbitControls extends Controller {

   constructor() {
      super();
   }

   Update() {
   }
   Move(){}
   Rotate(){}
   Pan(){
      const mouseDif = MouseGetPosDif();
		mouseDif.x /= VIEWPORT.WIDTH/2;
		mouseDif.y /= VIEWPORT.HEIGHT/2;
		target.Translate(mouseDif.x, mouseDif.y, 0)
   }

}

export function ControlsCreateContol(type) {

   switch (type) {
      case 'orbit': {

      }
   }
}