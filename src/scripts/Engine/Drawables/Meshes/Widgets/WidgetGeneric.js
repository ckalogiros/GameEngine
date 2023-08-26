"use strict";

import { Clamp, CopyArr2, CopyArr3 } from "../../../../Helpers/Math/MathOperations.js";
import { Geometry2D } from "../../Geometry/Base/Geometry.js";
import { Material } from "../../Material/Base/Material.js";
import { Mesh } from "../Base/Mesh.js";
import { Rect } from "../Rect.js";
import { Widget_Button_Mesh } from "./WidgetButton.js";
import { Widget_Label_Text_Mesh } from "./WidgetLabelText.js";
import { Widget_Slider } from "./WidgetSlider.js";


/**
 * As a functionality controller implementation.
 * Position_Controller does not store any data,
 * it just calculates and changes the mesh data,.
 */
class Position_Controller {

   // Pass param values: Restrict, row-column positioning
   FitAll(parent, align_flags, size_flags, restrict_percent = [1,1], grid_pos = 0){
      
      restrict_percent[0] = Clamp(restrict_percent[0], 0, 1);
      restrict_percent[1] = Clamp(restrict_percent[1], 0, 1);

      const pad = 5;

      const a = this.#CreateActiveMeshes(parent.children);

      const pos = [0,0]
      pos[0] = parent.geom.pos[0];
      pos[1] = parent.geom.pos[1];
      const dim = [0,0]
      dim[0] = parent.geom.dim[0];
      dim[1] = parent.geom.dim[1];

      const left = pos[0] - dim[0] ;
      const top = pos[1] - dim[1];

      // const restrict = size_flags & SIZER.RESTRICT ? restrict_val : dim[1];
      dim[0] = size_flags & SIZER.RESTRICT ? dim[1]*restrict_percent[0] : dim[0];
      dim[1] = size_flags & SIZER.RESTRICT ? dim[1]*restrict_percent[1] : dim[1];
      
      const avg_width  = (( dim[0] - ( (pad/2)*(a.count+1)) ) /a.count);
      const avg_height = (( dim[1] - ( (pad/2)*(a.count+1)) ) /a.count);

      
      // Ceil the grid_pos to a grid position that does not exceed the limits of the parent's dimention.
      while(grid_pos*dim[0] > parent.geom.dim[0]) 
         grid_pos--;
      
      

      pos[0] = left + avg_width + pad;
      pos[1] = top + avg_height + pad;
      
      
      // if(align_flags & ALIGN.LEFT){ pos[0] = left + restrict + pad }
      // else if(align_flags & ALIGN.RIGHT){ pos[0] = right - restrict - pad }
      
      if(align_flags & ALIGN.HORIZONTAL) dim[1] -= pad
      else if(align_flags & ALIGN.VERTICAL) dim[0] -= pad
      
      for( let i=0; i< a.count; i++){
         
         const child = a.buffer[i];
                  
         if(align_flags & ALIGN.VERTICAL){
            
            child.geom.dim[1] = avg_height;            
            child.geom.pos[1] = pos[1];            
            // Devide by the restriction places objects as to how they would be place without the restriction      
            pos[1] += (avg_height/restrict_percent[1])*2+pad; 
            
            child.geom.pos[0] = 
            (left+dim[0]+pad) // Starting point but from the left og the mesh as the start
            + 
            ((((dim[0]*2))+pad*2) * (grid_pos-1)); // Advance by the dimention ammount times the grid position(*1, *2, *3, ... etc)             
               // (left+avg_width*2/restrict_percent[0]+pad*2) // Starting point but from the left og the mesh as the start
               // + 
               // ((((avg_width*2/restrict_percent[0])*2)+pad) * (grid_pos-1)); // Advance by the dimention ammount times the grid position(*1, *2, *3, ... etc)             
            child.geom.dim[0] = dim[0];            
         }
         else if(align_flags & ALIGN.HORIZONTAL){
            
            // dim[1] -= pad;
            
            child.geom.dim[0] = avg_width;            
            child.geom.pos[0] = pos[0];            
            pos[0] += (avg_width/restrict_percent[0])*2+pad;   
            
            // child.geom.pos[1] = (top+avg_height+pad) + (((avg_height*2)+pad) * (grid_pos-1));             
            // child.geom.pos[1] = pos[1] + (avg_height*grid_pos);            
            child.geom.dim[1] = dim[1];   
         }
         
         // if(child.children.count)
         //       this.FitAll(child, align_flags, size_flags, restrict_percent, grid_pos)
      }

   }

   #CreateActiveMeshes(children){

      const active = {
         buffer: [],
         count: 0,
         sum: { width: 0, height:0, }
      }
      
      for(let i=0; i< children.count; i++){

         const child = children.buffer[i];
         if(child){

            active.buffer[i] = child;
            active.sum.width += child.geom.dim[0]
            active.sum.height += child.geom.dim[1]
            active.count++;
         }
      }
      return active;
   }

   #CalcTotalTotals(children){
      
      const sum = {
         width: 0, height:0,
      }
      
      for(let i=0; i< children.count; i++){

         const child = parent.children.buffer[i];
         if(child){

            sum.width += child.geo.dim[0]
            sum.height += child.geo.dim[1]
         }
      }
      return sum;
   }

   #GetPos(mesh){ return mesh.geom.pos; }
   #GetDim(mesh){ return mesh.geom.dim; }
   #GetLeft(mesh){ return mesh.geom.pos[0] - mesh.geom.dim[0]; }
   #GetRight(mesh){ return mesh.geom.pos[0] + mesh.geom.dim[0]; }
   #GetTop(mesh){ return mesh.geom.pos[1] - mesh.geom.dim[1]; }
   #GetBottom(mesh){ return mesh.geom.pos[1] + mesh.geom.dim[1]; }
}

function Resize(mesh){

   
}

const _position_controller = new Position_Controller;

export class Widget_Generic extends Mesh{

   constructor(pos = [Viewport.width/2, Viewport.height/2, 0], dim = [20, 20], col = GREY1){

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(ORANGE_240_130_10);

      super(geom, mat);

      this.type |= MESH_TYPES_DBG.WIDGET_GENERIC;
   }

   AddSection(_dim=null){

      const pos = [0,0,0];
      const dim = [0,0];
      const pad = 5;

      CopyArr3(pos, this.geom.pos);
      pos[2] += 5;

      if(!_dim){
         dim[0] = this.geom.dim[0] - pad;
         dim[1] = this.geom.dim[1] - pad;
      }
      else CopyArr2(dim, _dim);

      // {
      //    const section = new Widget_Slider(pos, dim, BLUE_10_120_220);
      //    this.AddChild(section);
      // }
      // {
      //    const section = new Widget_Label_Text_Mesh('item', pos, 7, BLUE_10_120_220, WHITE, [1, 1], [3, 3], .4);
      //    this.AddChild(section);
      // }
      // {
      //    const section = new Widget_Label_Text_Mesh('item', pos, 7, BLUE_10_120_220, WHITE, [1, 1], [3, 3], .4);
      //    this.AddChild(section);
      // }
      // {
      //    const section = new Widget_Label_Text_Mesh('item', pos, 7, BLUE_10_120_220, WHITE, [1, 1], [3, 3], .4);
      //    this.AddChild(section);
      // }

      {
         const section = new Rect(pos, dim, GREY1);
         this.AddChild(section);
         pos[2] += 3
         const slider = new Widget_Slider(pos, [dim[0], 16], BLUE_10_120_220);
         section.AddChild(slider);
      }
      {
         const section = new Rect(pos, dim, WHITE);
         this.AddChild(section);
      }
      {
         const section = new Rect(pos, dim, GREY1);
         this.AddChild(section);
      }
      {
         const section = new Rect(pos, dim, WHITE);
         this.AddChild(section);
      }

      /** */
      // _position_controller.FitAll(this, ALIGN.VERTICAL, null, undefined, 1);
      // _position_controller.FitAll(this, ALIGN.HORIZONTAL, null, undefined, 10);
      _position_controller.FitAll(this, ALIGN.VERTICAL, SIZER.RESTRICT, [1,1], 1);
      // _position_controller.FitAll(this, ALIGN.HORIZONTAL, SIZER.RESTRICT, [.5,1], 1);
   }

   CreateGfxCtx(sceneIdx){

      
      // for(let i=0; i<this.children.count; i++){
      for(let i=this.children.count-1; i>=0; i--){
         
         const child = this.children.buffer[i];
         Recursive_add_to_gfx_buffers(child)
         child.CreateGfxCtx(sceneIdx);
      }

      const gfx = super.CreateGfxCtx(sceneIdx)

      return gfx;
   }

} 

function Recursive_add_to_gfx_buffers(_mesh, sceneIdx){

   const children = _mesh.children;
   for (let i = 0; i < children.count; i++) {

         const mesh = children.buffer[i];
         // if (mesh.children.count)
         //    Recursive_add_to_gfx_buffers(mesh, sceneIdx)

            mesh.CreateGfxCtx(sceneIdx);
   }
}
