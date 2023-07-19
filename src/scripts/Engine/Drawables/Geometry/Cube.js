import { GlAddGeometry } from "../../../Graphics/Buffers/GlBuffers.js";
import { CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Geometry3D } from "../Geometry.js";

const F1 = 0;
const F2 = 1;
const F3 = 2;
const F4 = 3;
const F5 = 4;
const F6 = 5;

export class Cube extends Geometry3D {

   faces;

   constructor(pos, dim, scale) {

      super(pos, dim, scale);

      this.faces = [];
      for (let i = 0; i < 6; i++) {
         this.faces[i] = null;
      }
   }

   //////////////////////////////////////////////////////////////
   AddToGraphicsBuffer(sid, gfx, meshName) {

      let gfxCopy = gfx;
      let pos = [0, 0, 0];
      CopyArr3(pos, this.pos);
      GlAddGeometry(sid, this.pos, this.dim, this.time, gfxCopy, meshName, 1);
      console.log(gfxCopy)
      // this.BuildFace([], dim, )

      /**
         front          right          top
         -x  y  z        x  y -z       -x  y  z   
         -x -y  z        x -y -z       -x  y -z   
          x  y  z        x  y  z        x  y  z   
          x -y  z        x -y  z        x  y -z   
         back           left           bottom
         -x  y -z       -x  y -z       -x -y  z   
         -x -y -z       -x -y -z       -x -y  z   
          x  y -z       -x  y  z        x -y  z   
          x -y -z       -x -y  z        x -y  z   
      */

      // GlAddGeometry(sid, this.pos, this.dim, this.time, gfxCopy, meshName, 1);
      
   }
}