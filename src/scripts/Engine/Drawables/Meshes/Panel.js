"use strict";

import { CopyArr2, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { M_Buffer } from "../../Core/Buffers.js";
import { RegisterEvent } from "../../Events/Events.js";
import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { MAT_ENABLE, Material } from "../Material/Base/Material.js";
import { MESH_ENABLE, Mesh } from "./Base/Mesh.js";


export class Panel extends Mesh {

   sections; // Buffer to store Sections

   constructor(pos = [0, 0, 0], dim = [100, 100], col = BLUE) {

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);

      super(geom, mat);

      this.sections = new M_Buffer;
      this.type |= MESH_TYPES_DBG.PANEL_MESH;
   }

   AddSection(section) {
      ERROR_TYPE(section, MESH_TYPES_DBG.SECTION_MESH);

      this.sections.Add(section);

      if (section.children.active_count) {

         for (let i = 0; i < section.children.count; i++) {

            const child = section.children.buffer[i];
            this.AddChild(child);
         }
      }
   }

   AddToGraphicsBuffer(sceneIdx) {

      const gfx = super.AddToGraphicsBuffer(sceneIdx);

      for (let i = 0; i < this.sections.count; i++) {

         const section = this.sections.buffer[i];

         if (section.sections.count) {

            for (let i = 0; i < section.sections.count; i++) {

               const s = section.sections.buffer[i];

               s.AddToGraphicsBuffer(sceneIdx);
            }
         }

         section.AddToGraphicsBuffer(sceneIdx);
      }

      return gfx;
   }
}

/**
 * TODO: 
 *    Implement: 
 *       Add_pre. add a mesh at the start of the children's buffer.
 *       Add_specific. add a mesh at a specific index of the children's buffer.
 */
export class Section extends Mesh {

   flags; // Stores some state of 'this'.
   margin; // [1,1] Stores the x-y margins
   padding; // [1,1] Stores padding for the meshes in-between space.
   max_size;

   constructor(flags = (SECTION.VERTICAL), margin = [4, 4], pos = [200, 400, 0], dim = [40, 40], col = TRANSPARENCY(BLUE, .6)) {

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);

      super(geom, mat);
      
      this.flags = flags;
      this.margin = margin;
      this.max_size = [0, 0];

      this.type |= MESH_TYPES_DBG.SECTION_MESH;
      this.SetName();

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(0, 3.5, 2.);
   }

   AddItem(mesh, flags) {

      this.flags |= flags;
      const idx = this.children.Add(mesh);

      if (mesh.type & MESH_TYPES_DBG.SECTION_MESH) { // Handle other sections

         if (flags & SECTION.FIT) {

            TODO: implement 
         }
         else if (flags & SECTION.ITEM_FIT) {

            CopyArr3(mesh.geom.pos, this.geom.pos);
            mesh.geom.pos[2] += 1;
         }
      }
      else { // Handle Items 

         CopyArr3(mesh.geom.pos, this.geom.pos);
         mesh.geom.pos[2] += 1;

         // RegisterEvent('mesh-created', mesh);
         // mesh.timedEvents.Add({
         //    Clbk: mesh.SetZindex,
         //    params: {
         //       mesh: mesh,
         //       z: mesh.geom.pos[2] + 1,
         //    }
         // })
      }
   }

   Calc(flags) {

      const section = this;

      let top = section.geom.pos[1]; // Top starting position
      let left = section.geom.pos[0]; // Left starting position

      Calculate_sizes_recursive(section, top, left, flags)
      CopyArr2(section.geom.dim, section.max_size); // Set size for the root.
      
      Calculate_positions_recursive(section, flags);

      section.SetMargin()
      section.geom.pos[1] +=  section.margin[1];
      section.geom.pos[0] +=  section.margin[1];

      console.log(section.geom.pos, section.geom.dim)

   }

   Recalc(flags){

      const section = this;

      this.Reset(section)
      this.Calc(flags)

   }

   Reset(section){

      for (let i = 0; i < section.children.active_count; i++) {
         
         const mesh = section.children.buffer[i];
         if (mesh.children.active_count && mesh.type & MESH_TYPES_DBG.SECTION_MESH) {
            this.Reset(mesh);
         }
         
      }
      section.max_size[0] = 0;
      section.max_size[1] = 0;

   }

   UpdateGfx(section, sceneIdx){
      this.UpdateGfxRecursive(section, sceneIdx);

      if(!section.gfx) section.AddToGraphicsBuffer(sceneIdx); // Add any un-added meshes.
      section.UpdatePosXY(); // Update for the root
      section.UpdateDim(); // Update for the root
   }

   UpdateGfxRecursive(section, sceneIdx){

      for (let i = 0; i < section.children.active_count; i++) {
         
         const mesh = section.children.buffer[i];
         if (mesh.children.active_count && mesh.type & MESH_TYPES_DBG.SECTION_MESH) {
            this.UpdateGfxRecursive(mesh, sceneIdx);
         }
         
         if(mesh.gfx !== null){
            /** TODO: In GFX Implement a function specific to handle pos-dim vertex buffer updates */
            mesh.UpdatePosXY();
            mesh.UpdateDim();
         }
         else 
            mesh.AddToGraphicsBuffer(sceneIdx); // Add any un-added meshes.
      }

   }

   AddToGraphicsBuffer(sceneIdx, useSpecificVertexBuffer = GL_VB.ANY, vertexBufferIdx = INT_NULL) {

      const gfx = super.AddToGraphicsBuffer(sceneIdx,useSpecificVertexBuffer, vertexBufferIdx);
      // for (let i = this.children.count - 1; i >= 0; i--) {

      //    const child = this.children.buffer[i];
      //    if (child)
      //       var ggg = child.AddToGraphicsBuffer(sceneIdx, useSpecificVertexBuffer, vertexBufferIdx);
      // }

      return gfx;
   }

   SetMargin() {
      this.geom.dim[0] += this.margin[0];
      this.geom.dim[1] += this.margin[1];
   }

}

function Expand(section, flags) {

   for (let i = 0; i < section.children.active_count; i++) {

      const mesh = section.children.buffer[i];

      if(section.type & MESH_TYPES_DBG.SECTION_MESH){

         if(mesh.flags & SECTION.EXPAND) {

            // if(mesh.max_size[0] < section.max_size[0])
            //    mesh.geom.dim[0] = mesh.max_size[0] 
            // mesh.geom.pos[0] += mesh.geom.dim[0]/4
         }
      }
      
      Expand(mesh, flags)
      
      if (section.flags & SECTION.VERTICAL) {
      }
      else if (section.flags & SECTION.HORIZONTAL) {
      }
   }
}

function Calculate_positions_recursive(section, flags) {

   const padding = [0, 0]
   let ret = { size: [0, 0], margin: [0, 0] }

   const cur_pos = [section.geom.pos[0], section.geom.pos[1]]

   for (let i = 0; i < section.children.active_count; i++) {

      const mesh = section.children.buffer[i];

      if(section.type & MESH_TYPES_DBG.SECTION_MESH){

         mesh.geom.pos[0] = cur_pos[0] - section.geom.dim[0] + mesh.geom.dim[0] + section.margin[0];
         mesh.geom.pos[1] = cur_pos[1] - section.geom.dim[1] + mesh.geom.dim[1] + section.margin[1];
      }
      else{

         mesh.geom.pos[0] = cur_pos[0] - section.geom.dim[0] + mesh.geom.dim[0]*1.5;// Fixes the button mis-alignment
         mesh.geom.pos[1] = cur_pos[1] - section.geom.dim[1] + mesh.geom.dim[1]*1.5;// Fixes the button mis-alignment
      }
      
      ret = Calculate_positions_recursive(mesh, flags)
      
      if (section.flags & SECTION.VERTICAL) {
         cur_pos[1] += mesh.geom.dim[1] * 2
      }
      else if (section.flags & SECTION.HORIZONTAL) {
         cur_pos[0] += mesh.geom.dim[0] * 2
      }
   }

   return cur_pos;
}

function Calculate_sizes_recursive(section, top, left, flags, accumulative_margin = [0, 0]) {

   const padding = [0, 0]
   const margin = accumulative_margin;
   let accum_size = [0, 0]

   for (let i = 0; i < section.children.active_count; i++) {

      const mesh = section.children.buffer[i];
      if (mesh.children.active_count && mesh.type & MESH_TYPES_DBG.SECTION_MESH) {
                  
         margin[1] += mesh.margin[1];
         margin[0] += mesh.margin[0];
         Calculate_sizes_recursive(mesh, top, left, flags, margin);
         
         mesh.geom.dim[0] = mesh.max_size[0]
         mesh.geom.dim[1] = mesh.max_size[1]
         
         mesh.SetMargin();
         
         if (section.flags & SECTION.VERTICAL) {
            if(section.max_size[0] < mesh.geom.dim[0]) section.max_size[0]  = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1]
         }
         else if (section.flags & SECTION.HORIZONTAL) {
            section.max_size[0] += mesh.geom.dim[0]
            if(section.max_size[1] < mesh.geom.dim[1]) section.max_size[1]  = mesh.geom.dim[1]
         }

      }
      else { // Case the current item does not have children.

         if (section.flags & SECTION.VERTICAL) {
            accum_size[1] += mesh.geom.dim[1]
            accum_size[0] = mesh.geom.dim[0]
            if(section.max_size[0] < accum_size[0]) section.max_size[0]  = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1]
         }
         else if (section.flags & SECTION.HORIZONTAL) {
            accum_size[0] += mesh.geom.dim[0]
            accum_size[1] = mesh.geom.dim[1]
            section.max_size[0] += mesh.geom.dim[0]
            if(section.max_size[1] < accum_size[1]) section.max_size[1]  = mesh.geom.dim[1]
         }
      }
      
   }
}


// function RecCalc2(section, top, left, flags, accumulative_margin = [0, 0]) {

//    // const section = this;
//    const padding = [0, 0]
//    let ret = {
//       pos: [section.geom.pos[0], section.geom.pos[1]],
//       size: [0, 0],
//    }
//    const margin = accumulative_margin;
//    let pos = [0, 0];
//    margin[1] += section.margin[1];
//    margin[0] += section.margin[0];

//    // if (mesh.children.active_count) RecCalc2(mesh, top, left, flags)
//    for (let i = 0; i < section.children.active_count; i++) {

//       const mesh = section.children.buffer[i];

//       if (mesh.children.active_count) {

//          // margin[1] += mesh.margin[1];
//          // margin[0] += mesh.margin[0];

//          ret = RecCalc2(mesh, top, left, flags, margin)

//          // console.log(ret.size, margin, mesh.name)

//          if (ret.size[0] > 0) mesh.geom.dim[0] = ret.size[0]
//          if (ret.size[1] > 0) mesh.geom.dim[1] = ret.size[1]
//          mesh.SetMargin()

//          mesh.geom.pos[0] = left + mesh.geom.dim[0];
//          mesh.geom.pos[1] = top + mesh.geom.dim[1];
//          // mesh.geom.pos[0] = ret.pos[0];
//          // mesh.geom.pos[1] = ret.pos[1];

//          if (section.flags & SECTION.VERTICAL) {
//             top += mesh.geom.dim[1] * 2 + mesh.margin[1]; // This is only for more than 1 children in a section
//             ret.size[1] += mesh.geom.dim[1]
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {
//             left += mesh.geom.dim[0] * 2 + mesh.margin[0]; // This is only for more than 1 children in a section
//             ret.size[0] += mesh.geom.dim[0]
//          }

//       }
//       else { // Case the current item does not have children.

//          mesh.geom.pos[0] = left + mesh.geom.dim[0] + section.margin[0];
//          mesh.geom.pos[1] = top + mesh.geom.dim[1] + section.margin[1];
//          // mesh.geom.pos[0] = left + mesh.geom.dim[0] + margin[0]/2;
//          // mesh.geom.pos[1] = top  + mesh.geom.dim[1] + margin[1]/2;

//          if (section.flags & SECTION.VERTICAL) {
//             top += mesh.geom.dim[1] * 2; // This is only for more than 1 children in a section
//             ret.size[1] += mesh.geom.dim[1]
//             ret.pos[1] += ret.size[1] / 2;
//             pos[1] += mesh.geom.dim[1] + margin[1];
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {
//             left += mesh.geom.dim[0] * 2; // This is only for more than 1 children in a section
//             ret.size[0] += mesh.geom.dim[0]
//             ret.pos[0] += ret.size[0] / 2;
//             pos[0] += mesh.geom.dim[0] + margin[0] / 2;
//          }
//       }
//       console.log(pos, mesh.geom.pos, mesh.name)
//    }

//    return ret;
// }

// function Recursive_calc_dim(section, flags) {

//    let dim = [0, 0]

//    for (let i = 0; i < section.children.count; i++) {

//       const mesh = section.children.buffer[i];

//       if (mesh.children.active_count) Recursive_calc_dim(mesh, flags)

//       if (section.flags & SECTION.VERTICAL) {
//          dim[1] += mesh.geom.dim[1];
//       }
//       else if (section.flags & SECTION.HORIZONTAL) {
//          dim[0] += mesh.geom.dim[0];
//       }
//    }

//    if (section.flags & SECTION.VERTICAL) section.geom.dim[1] = dim[1];
//    else if (section.flags & SECTION.HORIZONTAL) section.geom.dim[0] = dim[0];
// }

// function Recursive_calc_pos(section, left, top, flags) {

//    const padding = [0, 0]

//    for (let i = 0; i < section.children.count; i++) {

//       const mesh = section.children.buffer[i];

//       if (mesh.children.active_count) Recursive_calc_pos(mesh, flags)

//       if (section.flags & SECTION.VERTICAL) {

//          mesh.geom.pos[1] = top;
//          mesh.geom.pos[1] += mesh.geom.dim[1];
//          top += mesh.geom.dim[1] * 2;

//          mesh.geom.pos[0] = left + mesh.geom.dim[0];
//       }
//       else if (section.flags & SECTION.HORIZONTAL) {

//          mesh.geom.pos[0] = left;
//          mesh.geom.pos[0] += mesh.geom.dim[0];
//          left += mesh.geom.dim[0] * 2;

//          mesh.geom.pos[1] = top + mesh.geom.dim[1];
//       }
//    }
//    section.SetMargin();
// }

// function Calc_all_children_dim(section, flags) {

//    if (!section.children.active_count) return null;

//    let dim = [0, 0]

//    for (let i = 0; i < section.children.active_count; i++) {

//       const mesh = section.children.buffer[i];

//       if (section.flags & SECTION.VERTICAL) dim[1] += mesh.geom.dim[1];
//       else if (section.flags & SECTION.HORIZONTAL) dim[0] += mesh.geom.dim[0];

//    }

//    // if (section.flags & SECTION.VERTICAL) section.geom.dim[1] = dim[1];
//    // else if (section.flags & SECTION.HORIZONTAL) section.geom.dim[0] = dim[0];

//    return dim;
// }

// function Calc_pos(section, left, top, flags) {

//    const padding = [0, 0]

//    for (let i = 0; i < section.children.count; i++) {

//       const mesh = section.children.buffer[i];

//       if (section.flags & SECTION.VERTICAL) {

//          mesh.geom.pos[1] = top;
//          mesh.geom.pos[1] += mesh.geom.dim[1];
//          top += mesh.geom.dim[1] * 2;

//          mesh.geom.pos[0] = left + mesh.geom.dim[0];
//       }
//       else if (section.flags & SECTION.HORIZONTAL) {

//          mesh.geom.pos[0] = left;
//          mesh.geom.pos[0] += mesh.geom.dim[0];
//          left += mesh.geom.dim[0] * 2;

//          mesh.geom.pos[1] = top + mesh.geom.dim[1];
//       }
//    }
// }
