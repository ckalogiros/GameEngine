"use strict";

import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { Geometry2D_Text } from "../Geometry/Geometry2DText.js";
import { FontMaterial, Material } from "../Material/Base/Material.js";
import { Mesh, Text_Mesh } from "./Base/Mesh.js";


export class Rect extends Mesh{

   constructor(pos = POSITION_CENTER, dim = [10, 10], col = BLUER3){

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);
      
      super(geom, mat);

      this.type |= MESH_TYPES_DBG.RECT_MESH;
   }

   GenGfxCtx(FLAGS, gfxidx){
       
      super.GenGfxCtx(FLAGS, gfxidx);
      // console.log(this.name, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.vb.start)

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         if(child)
            child.GenGfxCtx(FLAGS, gfxidx); // Propagate the same functionality we apply here down the tree of meshes
      }

   }
   
   AddToGfx(){

      super.AddToGfx();

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         if(child)
            child.AddToGfx(); // Propagate the same functionality we apply here down the tree of meshes
      }
   }
   
}


export class I_Text extends Text_Mesh{

	constructor(text, pos=[0,0,0], fontSize = 4, scale = [1, 1], color = WHITE, bold = 4, font = TEXTURES.SDF_CONSOLAS_LARGE) {

		const sdfouter = CalculateSdfOuterFromDim(fontSize);
		if (sdfouter + bold > 1) bold = 1 - sdfouter;
		const mat = new FontMaterial(color, font, text, [bold, sdfouter])
		const geom = new Geometry2D_Text(pos, fontSize, scale, text, font);

		super(geom, mat);
      super.SetName('T_Text')
   }

   GenGfxCtx(FLAGS, gfxidx){
      
      super.GenGfxCtx(FLAGS, gfxidx);
      // console.log(this.name, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.vb.start)

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         if(child)
            child.GenGfxCtx(FLAGS, gfxidx); // Propagate the same functionality we apply here down the tree of meshes
      }

   }
   
   AddToGfx(){

      super.AddToGfx();

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         if(child)
            child.AddToGfx(); // Propagate the same functionality we apply here down the tree of meshes
      }
   }
}



