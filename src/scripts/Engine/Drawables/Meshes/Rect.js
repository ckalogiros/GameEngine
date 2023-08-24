"use strict";

import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { Material } from "../Material/Base/Material.js";
import { Mesh } from "./Base/Mesh.js";


export class Rect extends Mesh{

   constructor(pos = POSITION_CENTER, dim = [10, 10], col = BLUER3){

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);
      
      super(geom, mat);

      this.type |= MESH_TYPES_DBG.RECT_MESH;
   }

}


class Section extends Rect {

   constructor(pos = POSITION_CENTER, dim = [10, 10], col = BLUER3){

      const section = new Rect(pos, dim, col);
      
      super(section.geom, section.mat);

      this.type |= MESH_TYPES_DBG.SECTION_MESH;
   }
}