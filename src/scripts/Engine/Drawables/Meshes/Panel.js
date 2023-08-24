"use strict";

import { CopyArr2, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { M_Buffer } from "../../Core/Buffers.js";
import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { Material } from "../Material/Base/Material.js";
import { Mesh } from "./Base/Mesh.js";


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
   padding; // [1,1] Stores padding for the inbetween meshes space.
   panel; // Single panel used as the root mesh.
   max_size;

   constructor(flags = (SECTION.VERTICAL), margin = [4, 4], pos = [200, 400, 0], dim = [40, 40], col = TRANSPARENCY(BLUE, .6)) {

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);

      super(geom, mat);

      this.flags = flags;
      this.margin = margin;
      this.max_size = [0, 0];
      this.panel = null;

      this.type |= MESH_TYPES_DBG.SECTION_MESH;
      this.SetName();
   }

   AddItem(mesh, flags) {

      // this.flags |= flags;
      const idx = this.children.Add(mesh);

      if (mesh.type & MESH_TYPES_DBG.SECTION_MESH) { // Handle other sections

         if (flags & SECTION.FIT) {

            CopyArr3(this.geom.pos, mesh.geom.pos);
            mesh.geom.pos[2] = this.geom.pos[2] + 1;

            if (this.geom.dim[0] < mesh.geom.dim[0]) this.geom.dim[0] = mesh.geom.dim[0]; // + this.margin[0];
            if (this.geom.dim[1] < mesh.geom.dim[1]) this.geom.dim[1] = mesh.geom.dim[1]; // + this.margin[1];
         }
         else if (flags & SECTION.ITEM_FIT) {

            CopyArr3(mesh.geom.pos, this.geom.pos);
            mesh.geom.pos[2] += 1;
         }
      }
      else { // Handle Items 

      }
   }

   Calc2(flags) {

      const section = this;

      let top = section.geom.pos[1] - section.geom.dim[1]; // Top starting position
      let left = section.geom.pos[0] - section.geom.dim[0]; // Left starting position

      const proportions = Calculate_sizes_recursive(section, top, left, flags)
      // const proportions = RecCalc2(section, top, left, flags)

      // Calc_all_children_dim(section, flags); // Dimention calculation order is bottom up (inner children dictate the dimentions of parents)
      // section.geom.dim[0] = proportions[0];
      // section.geom.dim[1] = proportions[1];

      Calculate_positions_recursive(section, section.geom.pos, flags);

      section.SetMargin()

   }
   Calc(flags) {

      const section = this;
      const padding = [0, 0]
      let top = section.geom.pos[1] - section.geom.dim[1]; // Top starting position
      let left = section.geom.pos[0] - section.geom.dim[0]; // Left starting position
      const dim = [0, 0]; // Accumulates the size of all added items.

      for (let i = 0; i < section.children.count; i++) {

         const mesh = section.children.buffer[i];
         mesh.geom.pos[0] = left;
         mesh.geom.pos[1] = top;

         if (section.flags & SECTION.VERTICAL) {

            if (mesh.children.active_count) {

               Recursive_calc_dim(mesh, flags); // Dimention calculation order is bottom up (inner children dictate the dimentions of parents)

               // First we need to calculate the parents position, before we calculate the childrens position.
               mesh.geom.pos[1] = top + mesh.geom.dim[1] * 2;
               mesh.geom.pos[0] = left + mesh.geom.dim[0] * 2;
               // Calculate both x and y starting positions (items are added in top-left order, so we need the top-start and left start positions)
               const l = mesh.geom.pos[0] - mesh.geom.dim[0];
               const t = mesh.geom.pos[1] - mesh.geom.dim[1];
               Recursive_calc_pos(mesh, l, t, flags); // Position calculation order is top down (outer)

            }

            top += mesh.geom.dim[1] * 2; // Update top-start for the next item position
            dim[1] += mesh.geom.dim[1];  // Update dimention accumulator
            dim[0] = mesh.geom.dim[0];   //         ||

         }
         else if (section.flags & SECTION.HORIZONTAL) {

            if (mesh.children.active_count) {

               Recursive_calc_dim(mesh, flags);

               // First we need to calculate the parents position, before we calculate the childrens position.
               mesh.geom.pos[1] = top + mesh.geom.dim[1] * 2;
               mesh.geom.pos[0] = left + mesh.geom.dim[0] * 2;
               // Calculate both x and y starting positions (items are added in top-left order, so we need the top-start and left start positions)
               const l = mesh.geom.pos[0] - mesh.geom.dim[0];
               const t = mesh.geom.pos[1] - mesh.geom.dim[1];
               Recursive_calc_pos(mesh, l, t, flags)

            }

            left += mesh.geom.dim[0] * 2; // Update left-start for the next item position
            dim[0] += mesh.geom.dim[0];   // Update dimention accumulator
            dim[1] = mesh.geom.dim[1];    //         ||

         }
      }

      section.geom.dim[1] = dim[1];
      section.geom.dim[0] = dim[0];
      if (this.flags & SECTION.VERTICAL) {
         section.geom.pos[1] = top - dim[1] + (dim[1] / section.children.active_count) - this.margin[1] * 2;
         section.geom.pos[0] = left + dim[0] * 2 - this.margin[1] * 2;
      }
      else { //if(this.flags & SECTION.HORIZONTAL){
         section.geom.pos[0] = left - dim[0] + (dim[0] / section.children.active_count) - this.margin[1] * 2;
         section.geom.pos[1] = top + dim[1] * 2 - this.margin[1] * 2;
      }

      section.SetMargin();
   }

   AddToGraphicsBuffer(sceneIdx) {

      const gfx = super.AddToGraphicsBuffer(sceneIdx);
      for (let i = this.children.count - 1; i >= 0; i--) {

         const child = this.children.buffer[i];
         if (child)
            child.AddToGraphicsBuffer(sceneIdx);
      }

      return gfx;
   }

   SetMargin() {
      this.geom.dim[0] += this.margin[0];
      this.geom.dim[1] += this.margin[1];
      // console.log(this.name, this.geom.dim, this.geom.pos)
   }

}

function Calculate_positions_recursive(section, pos, flags) {

   const padding = [0, 0]
   let ret = {
      size: [0, 0],
      margin: [0, 0]
   }

   const cur_pos = [section.geom.pos[0], section.geom.pos[1]]

   for (let i = 0; i < section.children.active_count; i++) {

      const mesh = section.children.buffer[i];

      mesh.geom.pos[0] = cur_pos[0] - section.geom.dim[0] + mesh.geom.dim[0] + section.margin[1];
      mesh.geom.pos[1] = cur_pos[1] - section.geom.dim[1] + mesh.geom.dim[1] + section.margin[1];

      // console.log(mesh.geom.pos, mesh.name)

      ret = Calculate_positions_recursive(mesh, pos, flags)

      if (section.flags & SECTION.VERTICAL) {
         // pos[1] += mesh.geom.dim[1] * 2 + section.margin[1]; // This is only for more than 1 children in a section
         // cur_pos[1] += mesh.geom.dim[1] * 2 + section.margin[1]
         pos[1] += mesh.geom.dim[1] * 2; // This is only for more than 1 children in a section
         cur_pos[1] += mesh.geom.dim[1] * 2
      }
      else if (section.flags & SECTION.HORIZONTAL) {
         // pos[0] += mesh.geom.dim[0] * 2 + section.margin[0]; // This is only for more than 1 children in a section
         // cur_pos[0] += mesh.geom.dim[0] * 2 + section.margin[0]
         pos[0] += mesh.geom.dim[0] * 2 ; // This is only for more than 1 children in a section
         cur_pos[0] += mesh.geom.dim[0] * 2
      }
   }
   return ret;
}
/**Save 1 */
// function Calculate_positions_recursive(section, pos, flags) {

//    const padding = [0, 0]
//    let ret = {
//       size: [0,0],
//       margin: [0,0]
//    }

//    const cur_pos  = [section.geom.pos[0], section.geom.pos[1]]

//    for (let i = 0; i < section.children.active_count; i++) {

//       const mesh = section.children.buffer[i];

//       mesh.geom.pos[0] = pos[0] - mesh.geom.dim[0] + mesh.geom.dim[0];
//       // mesh.geom.pos[1] = pos[1] - section.geom.dim[1] + mesh.geom.dim[1];
//       mesh.geom.pos[1] = pos[1] + mesh.geom.dim[1] + section.margin[1];

//       console.log(mesh.geom.pos, mesh.name)

//       ret = Calculate_positions_recursive(mesh, pos, flags)

//       if (section.flags & SECTION.VERTICAL) {
//          // pos[1] += mesh.geom.dim[1] * 2 + mesh.margin[1]; // This is only for more than 1 children in a section
//          pos[1] += mesh.geom.dim[1] * 2 + section.margin[1]; // This is only for more than 1 children in a section
//          cur_pos[1] +=  mesh.geom.dim[1] * 2 + section.margin[1]
//       }
//       else if (section.flags & SECTION.HORIZONTAL) {
//          pos[0] += mesh.geom.dim[0] * 2 + section.margin[0]; // This is only for more than 1 children in a section
//          cur_pos[0] +=  mesh.geom.dim[0] * 2 + section.margin[0]
//       }

//       // console.log(pos, mesh.name)
//    }
//    return ret;
// }
// function Calculate_sizes_recursive(section, top, left, flags, accumulative_margin = [0, 0], max_size = [0, 0]) {
function Calculate_sizes_recursive(section, top, left, flags, accumulative_margin = [0, 0]) {

   const padding = [0, 0]
   const margin = accumulative_margin;
   let accum_size = [0, 0]

   for (let i = 0; i < section.children.active_count; i++) {

      const mesh = section.children.buffer[i];
      if (mesh.children.active_count) {
                  
         margin[1] += mesh.margin[1];
         margin[0] += mesh.margin[0];
         
         Calculate_sizes_recursive(mesh, top, left, flags, margin);
         
         mesh.geom.dim[0] = mesh.max_size[0]
         mesh.geom.dim[1] = mesh.max_size[1]
         
         mesh.SetMargin();

         console.log(accum_size, mesh.max_size, mesh.name)
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
            if(section.max_size[1] < accum_size[1]) section.max_size[1] += mesh.geom.dim[1]
         }
         else if (section.flags & SECTION.HORIZONTAL) {
            accum_size[0] += mesh.geom.dim[0]
            accum_size[1] = mesh.geom.dim[1]
            if(section.max_size[0] < accum_size[0]) section.max_size[0] += mesh.geom.dim[0]
            if(section.max_size[1] < accum_size[1]) section.max_size[1]  = mesh.geom.dim[1]
         }
      }
   }
}
/** */
// function Calculate_sizes_recursive(section, top, left, flags, accumulative_margin = [0, 0]) {

//    const padding = [0, 0]
//    const margin = accumulative_margin;
//    let accum_size = [0, 0]

//    for (let i = 0; i < section.children.active_count; i++) {

//       const mesh = section.children.buffer[i];

//       if (mesh.children.active_count) {
         
//          margin[1] += mesh.margin[1];
//          margin[0] += mesh.margin[0];

//          const accum = Calculate_sizes_recursive(mesh, top, left, flags, margin);

//          console.log(accum, accum_size, mesh.max_size, mesh.name)
//          if (section.flags & SECTION.VERTICAL) {
//             mesh.max_size[1] = accum[1]
//             mesh.max_size[0] = accum[0]
//             // mesh.max_size[0] = mesh.geom.dim[0]
//             if(section.max_size[0] < accum[0]) section.max_size[0]  = accum[0]
//             if(section.max_size[1] < accum[1]) section.max_size[1] += accum[1]
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {
//             mesh.max_size[0] = accum[0]
//             mesh.max_size[1] = accum[1]
//             // mesh.max_size[1] = mesh.geom.dim[1]
//             if(section.max_size[0] < accum[0]) section.max_size[0] += accum[0]
//             if(section.max_size[1] < accum[1]) section.max_size[1]  = accum[1]
//          }

         
//          if (mesh.flags & SECTION.VERTICAL) {
//             mesh.geom.dim[0] = mesh.max_size[0]
//             mesh.geom.dim[1] = accum[1]
//          }
//          else if (mesh.flags & SECTION.HORIZONTAL) {
//             mesh.geom.dim[0] = accum[0]
//             mesh.geom.dim[1] = mesh.max_size[1]
//          }
//          mesh.SetMargin()
//          accum[0] = 0;
//          accum[1] = 0;
//       }
//       else { // Case the current item does not have children.

//          if (section.flags & SECTION.VERTICAL) {
//             accum_size[1] += mesh.geom.dim[1]
//             accum_size[0] = mesh.geom.dim[0]
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {
//             accum_size[0] += mesh.geom.dim[0]
//             accum_size[1] = mesh.geom.dim[1]
//          }
//       }

//       // console.log(accum_size, mesh.max_size, mesh.name)
//    }

//    return accum_size;
// }
/** */
// function Calculate_sizes_recursive(section, top, left, flags, accumulative_margin = [0, 0]) {

//    const padding = [0, 0]
//    let ret = {
//       max_size: [0, 0],
//       size: [0, 0],
//       margin: [0, 0]
//    }
//    // ret.max_size = max_size;
//    const margin = accumulative_margin;

//    let sectionAccumSize = [0, 0]
//    let max_size = [0, 0]

//    for (let i = 0; i < section.children.active_count; i++) {

//       const mesh = section.children.buffer[i];

//       if (mesh.children.active_count) {
//          margin[1] += mesh.margin[1];
//          margin[0] += mesh.margin[0];
//          const accum = Calculate_sizes_recursive(mesh, top, left, flags, margin, ret.max_size);

//          // console.log(ret.size, sectionAccumSize, mesh.name)
//          // ret.size[0] += accum.size[0];
//          // ret.size[1] += accum.size[1];

         
//          // if (mesh.flags & SECTION.VERTICAL) {
            
//          //    mesh.geom.dim[0] = mesh.max_size[0]
//          //    mesh.geom.dim[1] = accum.size[1]
//          // }
//          // else if (mesh.flags & SECTION.HORIZONTAL) {
            
//          //    mesh.geom.dim[0] = accum.size[0]
//          //    mesh.geom.dim[1] = mesh.max_size[1]
//          // }
         
//          if (section.flags & SECTION.VERTICAL) {

//             // if (i === 0) ret.size[0] += mesh.geom.dim[0]
//             mesh.max_size[1] += mesh.geom.dim[1]
//             mesh.max_size[0] = mesh.geom.dim[0]
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {
            
//             // if (i === 0) ret.size[1] += mesh.geom.dim[1]
//             mesh.max_size[0] += mesh.geom.dim[0]
//             mesh.max_size[1] = mesh.geom.dim[1]
//          }

//          mesh.SetMargin()
//          // if(max_size[0] < mesh.geom.dim[0]) max_size[0] = mesh.geom.dim[0];
//          // if(max_size[1] < mesh.geom.dim[1]) max_size[1] = mesh.geom.dim[1];
//          // CopyArr2(section.max_size, max_size)
//          console.log(max_size, mesh.max_size, mesh.name)


//          // if (section.flags & SECTION.VERTICAL)
//          //    ret.size[1] += mesh.geom.dim[1]
//          // else if (section.flags & SECTION.HORIZONTAL)
//          //    ret.size[0] += mesh.geom.dim[0]

//       }
//       else { // Case the current item does not have children.

//          if (section.flags & SECTION.VERTICAL) {

//             ret.size[1] += mesh.geom.dim[1];
//             // if (i === 0) ret.size[0] += mesh.geom.dim[0]
//             section.max_size[1] += mesh.geom.dim[1]
//             if(section.max_size[0] < )
//             section.max_size[0] = mesh.geom.dim[0]
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {
            
//             ret.size[0] += mesh.geom.dim[0]
//             // if (i === 0) ret.size[1] += mesh.geom.dim[1]
//             section.max_size[0] += mesh.geom.dim[0]
//             section.max_size[1] = mesh.geom.dim[1]
//          }
//       }

//       if (mesh.flags & SECTION.VERTICAL) {
            
//          mesh.geom.dim[0] = mesh.max_size[0]
//          mesh.geom.dim[1] = mesh.max_size[1]
//       }
//       else if (mesh.flags & SECTION.HORIZONTAL) {
         
//          mesh.geom.dim[0] = mesh.max_size[0]
//          mesh.geom.dim[1] = mesh.max_size[1]
//       }
//       console.log(max_size, mesh.max_size, mesh.name)
//    }

//    return ret;
// }

/** Save 2 */
// function Calculate_sizes_recursive(section, top, left, flags, accumulative_margin = [0, 0]) {

//    const padding = [0, 0]
//    let ret = {
//       max_size: [0, 0],
//       size: [0, 0],
//       margin: [0, 0]
//    }
//    // ret.max_size = max_size;
//    const margin = accumulative_margin;

//    let sectionAccumSize = [0, 0]
//    let max_size = [0, 0]

//    for (let i = 0; i < section.children.active_count; i++) {

//       const mesh = section.children.buffer[i];

//       if (mesh.children.active_count) {
//          margin[1] += mesh.margin[1];
//          margin[0] += mesh.margin[0];
//          const accum = Calculate_sizes_recursive(mesh, top, left, flags, margin, ret.max_size);
//          // ret.max_size[0] = 0; ret.max_size[1] = 0

//          // console.log(ret.size, sectionAccumSize, mesh.name)
//          ret.size[0] += accum.size[0];
//          ret.size[1] += accum.size[1];

//          // mesh.geom.dim[0] = 0;
//          // mesh.geom.dim[1] = 0;


//          // mesh.geom.dim[0] = mesh.max_size[0]
//          // mesh.geom.dim[1] = mesh.max_size[1]
         
//          if (mesh.flags & SECTION.VERTICAL) {
            
//             mesh.geom.dim[0] = mesh.max_size[0]
//             mesh.geom.dim[1] = accum.size[1]
//          }
//          else if (mesh.flags & SECTION.HORIZONTAL) {
            
//             mesh.geom.dim[0] = accum.size[0]
//             mesh.geom.dim[1] = mesh.max_size[1]
//          }
         
//          if(max_size[0] < mesh.geom.dim[0]) max_size[0] = mesh.geom.dim[0];
//          if(max_size[1] < mesh.geom.dim[1]) max_size[1] = mesh.geom.dim[1];
//          CopyArr2(section.max_size, max_size)
//          console.log(max_size, mesh.max_size, mesh.name)

//          mesh.SetMargin()

//          if (section.flags & SECTION.VERTICAL)
//             ret.size[1] += mesh.geom.dim[1]
//          else if (section.flags & SECTION.HORIZONTAL)
//             ret.size[0] += mesh.geom.dim[0]

//          // console.log(ret.size, ret.max_size, section.name)
//          // ret.max_size[0] = 0; ret.max_size[1] = 0

//       }
//       else { // Case the current item does not have children.

//          if (section.flags & SECTION.VERTICAL) {

//             ret.size[1] += mesh.geom.dim[1];
//             if (i === 0) ret.size[0] += mesh.geom.dim[0]
//             section.max_size[1] += mesh.geom.dim[1]
//             // section.max_size[0] = mesh.geom.dim[0]
//             // ret.max_size[1] = (ret.max_size[1] < ret.size[1]) ? 
//             //             ret.size[1] : mesh.geom.dim[1];
//             // ret.max_size[0] = (ret.max_size[0] < ret.size[0]) ? 
//             //             ret.size[0] : mesh.geom.dim[0];
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {

//             ret.size[0] += mesh.geom.dim[0]
//             if (i === 0) ret.size[1] += mesh.geom.dim[1]
//             section.max_size[0] += mesh.geom.dim[1]
//             // section.max_size[1] = mesh.geom.dim[1]
//             // ret.max_size[1] = (ret.max_size[1] < ret.size[1]) ? 
//             //             ret.size[1] :  mesh.geom.dim[1];
//             // ret.max_size[0] = (ret.max_size[0] < ret.size[0]) ? 
//             //             ret.size[0] : mesh.geom.dim[0];
//          }

//          // if() ret.size[0] = 0; ret.size[1] = 0;
//       }
//       // console.log(ret.size, ret.max_size, sectionAccumSize, mesh.name)

//    }

//    // console.log(ret.size, ret.max_size, section.name)
//    return ret;
// }

/** Save 1 */
// function Calculate_sizes_recursive(section, top, left, flags, accumulative_margin = [0,0]) {

//    const padding = [0, 0]
//    let ret = {
//       size: [0,0],
//       margin: [0,0]
//    }
//    const margin = accumulative_margin;

//    for (let i = 0; i < section.children.active_count; i++) {

//       const mesh = section.children.buffer[i];

//       if (mesh.children.active_count) {

//          margin[1] += mesh.margin[1];
//          margin[0] += mesh.margin[0];

//          ret = RecCalc2(mesh, top, left, flags, margin)

//          console.log(ret.size, margin, mesh.name)

//          if(ret.size[0] > 0) mesh.geom.dim[0] = ret.size[0]
//          if(ret.size[1] > 0) mesh.geom.dim[1] = ret.size[1]
//          mesh.SetMargin()

//          mesh.geom.pos[0] = left + mesh.geom.dim[0];
//          mesh.geom.pos[1] = top  + mesh.geom.dim[1];

//          if (section.flags & SECTION.VERTICAL) {
//             top += mesh.geom.dim[1] * 2 + mesh.margin[1]; // This is only for more than 1 children in a section
//             ret.size[1] += mesh.geom.dim[1]
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {
//             left += mesh.geom.dim[0] * 2 + mesh.margin[0]; // This is only for more than 1 children in a section
//             ret.size[0] += mesh.geom.dim[0]
//          }

//       }
//       else{ // Case the current item does not have children.

//          mesh.geom.pos[0] = left + mesh.geom.dim[0] + section.margin[0];
//          mesh.geom.pos[1] = top  + mesh.geom.dim[1] + section.margin[1];

//          if (section.flags & SECTION.VERTICAL) {
//             top += mesh.geom.dim[1] * 2; // This is only for more than 1 children in a section
//             ret.size[1] += mesh.geom.dim[1]
//          }
//          else if (section.flags & SECTION.HORIZONTAL) {
//             left += mesh.geom.dim[0] * 2; // This is only for more than 1 children in a section
//             ret.size[0] += mesh.geom.dim[0]
//          }
//       }
//    }
//    return ret;
// }


function RecCalc2(section, top, left, flags, accumulative_margin = [0, 0]) {

   // const section = this;
   const padding = [0, 0]
   let ret = {
      pos: [section.geom.pos[0], section.geom.pos[1]],
      size: [0, 0],
   }
   const margin = accumulative_margin;
   let pos = [0, 0];
   margin[1] += section.margin[1];
   margin[0] += section.margin[0];
   // CopyArr2(pos, section.geom.pos)

   // if (mesh.children.active_count) RecCalc2(mesh, top, left, flags)
   for (let i = 0; i < section.children.active_count; i++) {

      const mesh = section.children.buffer[i];

      if (mesh.children.active_count) {

         // margin[1] += mesh.margin[1];
         // margin[0] += mesh.margin[0];

         ret = RecCalc2(mesh, top, left, flags, margin)

         // console.log(ret.size, margin, mesh.name)

         if (ret.size[0] > 0) mesh.geom.dim[0] = ret.size[0]
         if (ret.size[1] > 0) mesh.geom.dim[1] = ret.size[1]
         mesh.SetMargin()

         mesh.geom.pos[0] = left + mesh.geom.dim[0];
         mesh.geom.pos[1] = top + mesh.geom.dim[1];
         // mesh.geom.pos[0] = ret.pos[0];
         // mesh.geom.pos[1] = ret.pos[1];

         if (section.flags & SECTION.VERTICAL) {
            top += mesh.geom.dim[1] * 2 + mesh.margin[1]; // This is only for more than 1 children in a section
            ret.size[1] += mesh.geom.dim[1]
         }
         else if (section.flags & SECTION.HORIZONTAL) {
            left += mesh.geom.dim[0] * 2 + mesh.margin[0]; // This is only for more than 1 children in a section
            ret.size[0] += mesh.geom.dim[0]
         }

      }
      else { // Case the current item does not have children.

         mesh.geom.pos[0] = left + mesh.geom.dim[0] + section.margin[0];
         mesh.geom.pos[1] = top + mesh.geom.dim[1] + section.margin[1];
         // mesh.geom.pos[0] = left + mesh.geom.dim[0] + margin[0]/2;
         // mesh.geom.pos[1] = top  + mesh.geom.dim[1] + margin[1]/2;

         if (section.flags & SECTION.VERTICAL) {
            top += mesh.geom.dim[1] * 2; // This is only for more than 1 children in a section
            ret.size[1] += mesh.geom.dim[1]
            ret.pos[1] += ret.size[1] / 2;
            pos[1] += mesh.geom.dim[1] + margin[1];
         }
         else if (section.flags & SECTION.HORIZONTAL) {
            left += mesh.geom.dim[0] * 2; // This is only for more than 1 children in a section
            ret.size[0] += mesh.geom.dim[0]
            ret.pos[0] += ret.size[0] / 2;
            pos[0] += mesh.geom.dim[0] + margin[0] / 2;
         }
      }
      console.log(pos, mesh.geom.pos, mesh.name)
   }

   return ret;
}


/**Save 2 */
// function RecCalc2(section, top, left, flags) {

//    // const section = this;
//    const padding = [0, 0]
//    let dim = [0, 0]; // Accumulates the size of all added items.
//    let pos = [0,0,0]

//    // if (mesh.children.active_count) RecCalc2(mesh, top, left, flags)
//    for (let i = 0; i < section.children.active_count; i++) {

//       const mesh = section.children.buffer[i];

//       if (mesh.children.active_count) {
//          dim = RecCalc2(mesh, top, left, flags)
//          console.log(dim, mesh.name)
//          if(dim[0] > 0) mesh.geom.dim[0] = dim[0]
//          if(dim[1] > 0) mesh.geom.dim[1] = dim[1]
//          mesh.SetMargin()
//       }

//       mesh.geom.pos[0] = left; // Set first child to a starting position.
//       mesh.geom.pos[1] = top;
//       // mesh.geom.pos[0] = left + dim[0] - section.margin[0];
//       // mesh.geom.pos[1] = top  + dim[1] - section.margin[1];


//       if (section.flags & SECTION.VERTICAL) {

//          // Calculate both x and y starting positions (items are added in top-left order, so we need the top-start and left start positions)
//          const l = mesh.geom.pos[0] - mesh.geom.dim[0];
//          const t = mesh.geom.pos[1] - mesh.geom.dim[1];

//          // Calc_pos(mesh, l, t, flags); // Position calculation order is top down (outer)

//          top += mesh.geom.dim[1] * 2; // This is only for more than 1 children in a section
//          if(mesh.flags & SECTION.VERTICAL) dim[1] += mesh.geom.dim[1];  // Update dimention accumulator
//          if(mesh.flags & SECTION.HORIZONTAL) dim[0] += mesh.geom.dim[0];   //         ||

//       }
//       else if (section.flags & SECTION.HORIZONTAL) {

//          // Calculate both x and y starting positions (items are added in top-left order, so we need the top-start and left start positions)
//          const l = mesh.geom.pos[0] - mesh.geom.dim[0];
//          const t = mesh.geom.pos[1] - mesh.geom.dim[1];

//          // Calc_pos(mesh, l, t, flags); // Position calculation order is top down (outer)

//          left += mesh.geom.dim[0] * 2; // This is only for more than 1 children in a section
//          if(mesh.flags & SECTION.VERTICAL) dim[1] += mesh.geom.dim[1];  // Update dimention accumulator
//          if(mesh.flags & SECTION.HORIZONTAL) dim[0] += mesh.geom.dim[0]+40;   //         ||

//       }

//    }


//    // left -  dim[0]+(dim[0]/section.children.active_count) - this.margin[1]*2;
//    // if(dim[1] > 0) section.geom.dim[1] = dim[1] - section.margin[1]; 
//    // if(dim[0] > 0) section.geom.dim[0] = dim[0] - section.margin[0];
//    // if(dim[1] > 0) section.geom.dim[1] = dim[1]; 
//    // if(dim[0] > 0) section.geom.dim[0] = dim[0];
//    // dim[0] = 0;
//    // dim[1] = 0;
//    // console.log(section.name, dim)

//    return dim
// }

/**Save 1 */
// // function Calc(section, accum_dim, flags){
// function Calc(section, top, left, flags) {

//    const padding = [0, 0]
//    // let top = section.geom.pos[1] - section.geom.dim[1]; // Top starting position
//    // let left = section.geom.pos[0] - section.geom.dim[0]; // Left starting position
//    let accum_dim = [0, 0]; // Accumulates the size of all added items.

//    for (let i = 0; i < section.children.count; i++) {

//       const mesh = section.children.buffer[i];
//       mesh.geom.pos[0] = left;
//       mesh.geom.pos[1] = top;

//       if (mesh.children.active_count) accum_dim = Calc(mesh, top, left, flags)
//       console.log(accum_dim)

//       if (section.flags & SECTION.VERTICAL) {

//          // Recursive_calc_dim(mesh, flags); // Dimention calculation order is bottom up (inner children dictate the dimentions of parents)
//          const size = Calc_all_children_dim(mesh, flags); // Dimention calculation order is bottom up (inner children dictate the dimentions of parents)

//          if (size) {

//             mesh.geom.dim[0] = size[0]
//             mesh.geom.dim[1] = size[1]
//          }
//          // First we need to calculate the parents position, before we calculate the childrens position.
//          mesh.geom.pos[1] = top + mesh.geom.dim[1] * 2;
//          mesh.geom.pos[0] = left + mesh.geom.dim[0] * 2;

//          // // Calculate both x and y starting positions (items are added in top-left order, so we need the top-start and left start positions)
//          const l = mesh.geom.pos[0] - mesh.geom.dim[0];
//          const t = mesh.geom.pos[1] - mesh.geom.dim[1];

//          // Recursive_calc_pos(mesh, l, t, flags); // Position calculation order is top down (outer)
//          Calc_pos(mesh, l, t, flags); // Position calculation order is top down (outer)



//          top += mesh.geom.dim[1] * 2;        // Update top-start for the next item position
//          accum_dim[1] += mesh.geom.dim[1] * 2; // Update dimention accumulator
//          accum_dim[0] = mesh.geom.dim[0];    //         ||

//          // if(mesh.children.active_count) accum_dim = Calc(mesh, top, left, flags)
//       }

//       // else if(section.flags & SECTION.HORIZONTAL){

//       //    if(mesh.children.active_count) {

//       //       // Recursive_calc_dim(mesh, flags);

//       //       // // First we need to calculate the parents position, before we calculate the childrens position.
//       //       // mesh.geom.pos[1] = top + mesh.geom.dim[1]*2; 
//       //       // mesh.geom.pos[0] = left + mesh.geom.dim[0]*2;
//       //       // // Calculate both x and y starting positions (items are added in top-left order, so we need the top-start and left start positions)
//       //       // const l = mesh.geom.pos[0] - mesh.geom.dim[0];
//       //       // const t = mesh.geom.pos[1] - mesh.geom.dim[1];
//       //       // Recursive_calc_pos(mesh, l, t, flags)

//       //    }

//       //    left += mesh.geom.dim[0] * 2; // Update left-start for the next item position
//       //    accum_dim[0] += mesh.geom.dim[0];   // Update dimention accumulator
//       //    accum_dim[1] = mesh.geom.dim[1];    //         ||

//       // }

//    }

//    // section.geom.dim[1] = accum_dim[1];
//    // section.geom.dim[0] = accum_dim[0];

//    // if(section.flags & SECTION.VERTICAL){
//    //    // section.geom.pos[1] = top - accum_dim[1]+(accum_dim[1]/section.children.active_count);
//    //    // section.geom.pos[0] = left + accum_dim[0];
//    //    // section.geom.pos[1] = top ;
//    //    // section.geom.pos[0] = left - 80;
//    // }
//    // else { // if(this.flags & SECTION.HORIZONTAL){
//    //    section.geom.pos[0] = left - accum_dim[0]+(accum_dim[0]/section.children.active_count);
//    //    section.geom.pos[1] = top + accum_dim[1]*2 - section.margin[1]*2;
//    // }

//    // if(section.flags & SECTION.VERTICAL){
//    //    section.geom.pos[1] = top - accum_dim[1]+(accum_dim[1]/section.children.active_count) - section.margin[1]*2;
//    //    section.geom.pos[0] = left + accum_dim[0]*2  - section.margin[1]*2;
//    // }
//    // else { // if(this.flags & SECTION.HORIZONTAL){
//    //    section.geom.pos[0] = left - accum_dim[0]+(accum_dim[0]/section.children.active_count) - section.margin[1]*2;
//    //    section.geom.pos[1] = top + accum_dim[1]*2 - section.margin[1]*2;
//    // }

//    // section.SetMargin();
//    console.log(section.name, section.geom.pos, section.geom.dim)
//    return accum_dim;
// }

function Recursive_calc_dim(section, flags) {

   let dim = [0, 0]

   for (let i = 0; i < section.children.count; i++) {

      const mesh = section.children.buffer[i];

      if (mesh.children.active_count) Recursive_calc_dim(mesh, flags)

      if (section.flags & SECTION.VERTICAL) {
         dim[1] += mesh.geom.dim[1];
      }
      else if (section.flags & SECTION.HORIZONTAL) {
         dim[0] += mesh.geom.dim[0];
      }
   }

   if (section.flags & SECTION.VERTICAL) section.geom.dim[1] = dim[1];
   else if (section.flags & SECTION.HORIZONTAL) section.geom.dim[0] = dim[0];
}

function Recursive_calc_pos(section, left, top, flags) {

   const padding = [0, 0]

   for (let i = 0; i < section.children.count; i++) {

      const mesh = section.children.buffer[i];

      if (mesh.children.active_count) Recursive_calc_pos(mesh, flags)

      if (section.flags & SECTION.VERTICAL) {

         mesh.geom.pos[1] = top;
         mesh.geom.pos[1] += mesh.geom.dim[1];
         top += mesh.geom.dim[1] * 2;

         mesh.geom.pos[0] = left + mesh.geom.dim[0];
      }
      else if (section.flags & SECTION.HORIZONTAL) {

         mesh.geom.pos[0] = left;
         mesh.geom.pos[0] += mesh.geom.dim[0];
         left += mesh.geom.dim[0] * 2;

         mesh.geom.pos[1] = top + mesh.geom.dim[1];
      }
   }
   section.SetMargin();
}

function Calc_all_children_dim(section, flags) {

   if (!section.children.active_count) return null;

   let dim = [0, 0]

   for (let i = 0; i < section.children.active_count; i++) {

      const mesh = section.children.buffer[i];

      if (section.flags & SECTION.VERTICAL) dim[1] += mesh.geom.dim[1];
      else if (section.flags & SECTION.HORIZONTAL) dim[0] += mesh.geom.dim[0];

   }

   // if (section.flags & SECTION.VERTICAL) section.geom.dim[1] = dim[1];
   // else if (section.flags & SECTION.HORIZONTAL) section.geom.dim[0] = dim[0];

   return dim;
}

function Calc_pos(section, left, top, flags) {

   const padding = [0, 0]

   for (let i = 0; i < section.children.count; i++) {

      const mesh = section.children.buffer[i];

      if (section.flags & SECTION.VERTICAL) {

         mesh.geom.pos[1] = top;
         // mesh.geom.pos[1] += mesh.geom.dim[1] - mesh.margin[1];
         mesh.geom.pos[1] += mesh.geom.dim[1];
         top += mesh.geom.dim[1] * 2;

         mesh.geom.pos[0] = left + mesh.geom.dim[0];
      }
      else if (section.flags & SECTION.HORIZONTAL) {

         mesh.geom.pos[0] = left;
         mesh.geom.pos[0] += mesh.geom.dim[0];
         left += mesh.geom.dim[0] * 2;

         mesh.geom.pos[1] = top + mesh.geom.dim[1];
      }
   }
   // section.SetMargin();
}

/**  SAVE: DO Not Delete. ###SectionWorking_1 */
/**

export class Section extends Mesh {

   flags; // Stores some state of 'this'.
   margin; // [1,1] Stores the x-y margins
   padding; // [1,1] Stores padding for the inbetween meshes space.
   panel; // Single panel used as the root mesh.

   constructor(flags=(SECTION.VERTICAL), margin = [4,4], pos=[200, 400, 0], dim=[40,40], col=TRANSPARENCY(BLUE, .6)){

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);

      super(geom, mat);

      this.flags = flags;
      this.margin = margin;
      this.panel = null;

      this.type |= MESH_TYPES_DBG.SECTION_MESH;
      this.SetName();
   }

   AddItem(mesh, flags){

      // this.flags |= flags;
      const idx = this.children.Add(mesh);

      if(mesh.type & MESH_TYPES_DBG.SECTION_MESH){ // Handle other sections

         if(flags & SECTION.FIT){
            
            CopyArr3(this.geom.pos, mesh.geom.pos);
            mesh.geom.pos[2] = this.geom.pos[2] + 1;
            
            if(this.geom.dim[0] < mesh.geom.dim[0]) this.geom.dim[0] = mesh.geom.dim[0]; // + this.margin[0];
            if(this.geom.dim[1] < mesh.geom.dim[1]) this.geom.dim[1] = mesh.geom.dim[1]; // + this.margin[1];
         }
         else if(flags & SECTION.ITEM_FIT){
            
            CopyArr3(mesh.geom.pos, this.geom.pos);
            mesh.geom.pos[2] += 1;
         }
      }
      else{ // Handle Items 

      }
   }
   
   Calc(flags){

      const section = this;
      const padding = [0,0]
      let top = section.geom.pos[1] - section.geom.dim[1]; // Top starting position
      let left = section.geom.pos[0] - section.geom.dim[0]; // Left starting position
      const dim = [0,0]; // Accumulates the size of all added items.
      
      for (let i=0; i<section.children.count; i++){
         
         const mesh = section.children.buffer[i];
         mesh.geom.pos[0] = left;
         mesh.geom.pos[1] = top;

         if(section.flags & SECTION.VERTICAL){
            
            if(mesh.children.active_count) {

               Recursive_calc_dim(mesh, flags); // Dimention calculation order is bottom up (inner children dictate the dimentions of parents)
               
               // First we need to calculate the parents position, before we calculate the childrens position.
               mesh.geom.pos[1] = top + mesh.geom.dim[1]*2; 
               mesh.geom.pos[0] = left + mesh.geom.dim[0]*2;
               // Calculate both x and y starting positions (items are added in top-left order, so we need the top-start and left start positions)
               const l = mesh.geom.pos[0] - mesh.geom.dim[0];
               const t = mesh.geom.pos[1] - mesh.geom.dim[1];
               Recursive_calc_pos(mesh, l, t, flags); // Position calculation order is top down (outer)
               
            }
            
            top += mesh.geom.dim[1] * 2; // Update top-start for the next item position
            dim[1] += mesh.geom.dim[1];  // Update dimention accumulator
            dim[0] = mesh.geom.dim[0];   //         ||

         }
         else if(section.flags & SECTION.HORIZONTAL){
            
            if(mesh.children.active_count) {
               
               Recursive_calc_dim(mesh, flags);
               
               // First we need to calculate the parents position, before we calculate the childrens position.
               mesh.geom.pos[1] = top + mesh.geom.dim[1]*2; 
               mesh.geom.pos[0] = left + mesh.geom.dim[0]*2;
               // Calculate both x and y starting positions (items are added in top-left order, so we need the top-start and left start positions)
               const l = mesh.geom.pos[0] - mesh.geom.dim[0];
               const t = mesh.geom.pos[1] - mesh.geom.dim[1];
               Recursive_calc_pos(mesh, l, t, flags)
               
            }

            left += mesh.geom.dim[0] * 2; // Update left-start for the next item position
            dim[0] += mesh.geom.dim[0];   // Update dimention accumulator
            dim[1] = mesh.geom.dim[1];    //         ||
            
         }
      }

      section.geom.dim[1] = dim[1];
      section.geom.dim[0] = dim[0];
      if(this.flags & SECTION.VERTICAL){
         section.geom.pos[1] = top - dim[1]+(dim[1]/section.children.active_count) - this.margin[1]*2;
         section.geom.pos[0] = left + dim[0]*2  - this.margin[1]*2;
      }
      else { //if(this.flags & SECTION.HORIZONTAL){
         section.geom.pos[0] = left -  dim[0]+(dim[0]/section.children.active_count) - this.margin[1]*2;
         section.geom.pos[1] = top + dim[1]*2 - this.margin[1]*2;
      }

      section.SetMargin();
   }

   AddToGraphicsBuffer(sceneIdx){

      const gfx = super.AddToGraphicsBuffer(sceneIdx);
      for(let i=this.children.count-1; i>=0; i--){
         
         const child = this.children.buffer[i];
         if(child) 
            child.AddToGraphicsBuffer(sceneIdx);
      }

      return gfx;
   }

   SetMargin(){

      this.geom.dim[0] += this.margin[0];
      this.geom.dim[1] += this.margin[1];
   }

}

function Recursive_calc_dim(section, flags){

   let dim = [0, 0]

   for (let i=0; i<section.children.count; i++){
      
      const mesh = section.children.buffer[i];
      
      if(section.flags & SECTION.VERTICAL){
         dim[1] += mesh.geom.dim[1];
      }
      else if(section.flags & SECTION.HORIZONTAL){
         dim[0] += mesh.geom.dim[0];
      }
   }

   if(section.flags & SECTION.VERTICAL) section.geom.dim[1] = dim[1];
   else if(section.flags & SECTION.HORIZONTAL) section.geom.dim[0] = dim[0];
}
function Recursive_calc_pos(section, left, top, flags){

   const padding = [0,0]
   
   for (let i=0; i<section.children.count; i++){
      
      const mesh = section.children.buffer[i];
      
      if(section.flags & SECTION.VERTICAL){
         
         mesh.geom.pos[1] = top;
         mesh.geom.pos[1] += mesh.geom.dim[1];
         top += mesh.geom.dim[1] * 2;

         mesh.geom.pos[0] = left + mesh.geom.dim[0];
      }
      else if(section.flags & SECTION.HORIZONTAL){
         
         mesh.geom.pos[0] = left;
         mesh.geom.pos[0] += mesh.geom.dim[0];
         left += mesh.geom.dim[0] * 2;

         // mesh.geom.pos[1] = section.geom.pos[1];
         mesh.geom.pos[1] = top + mesh.geom.dim[1];
      }
   }
   section.SetMargin();
}
 */
