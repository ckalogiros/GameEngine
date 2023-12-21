"use strict";

import { GlSetColor, GlSetColorBatch, GlVbBatch } from "../../Graphics/Buffers/GlBufferOps";
import { Mult_arr4_scalar2 } from "../../Helpers/Math/MathOperations";
import { _pt7 } from "../Timers/PerformanceTimers";

const _groups = [];
let _count = 0;
let isactive = false;
let counter = 0;

export function BatchStore2(mesh, type, _data) {
  
  _pt7.Start();
  
  if(!mesh.gfx)
  console.log()
  const i = mesh.gfx.prog.groupidx;
  const j = mesh.gfx.prog.idx;
  const k = mesh.gfx.vb.idx;

  // TODO: The if's are checking always. Better to have them been build once, upon the gfx buffers creation, like the scene does.
  if(!_groups[i]){
    _groups[i] = [];
  }
  if(!_groups[i][j]){
    _groups[i][j] = [];
  }
  if(!_groups[i][j][k]){
    _groups[i][j][k] = [];
  }

  const data = {

    gfx:[i,j,k],
    start: mesh.gfx.vb.start,
    end: mesh.gfx.vb.end,
    type: type,
    pos:_data,
  }

  _groups[i][j][k].push(data);
  isactive = true;

  _pt7.Stop();
  
}
export function BatchStore(mesh, type, _data) {
  
  _pt7.Start();
  
  const i = mesh.gfx.prog.groupidx;
  const j = mesh.gfx.prog.idx;
  const k = mesh.gfx.vb.idx;

  // TODO: The if's are checking always. Better to have them been build once, upon the gfx buffers creation, like the scene does.
  if(!_groups[i]){
    _groups[i] = [];
  }
  if(!_groups[i][j]){
    _groups[i][j] = [];
  }
  if(!_groups[i][j][k]){
    _groups[i][j][k] = [];
  }

  const data = {

    gfx:mesh.gfx, // IMPORTANT: gfx must be a pointer to meshes gfx. The reason is that at the call of this function the mesh start and end hasn't been set yet.
    type: type,
    pos:_data,
  }

  _groups[i][j][k].push(data);
  isactive = true;

  if(mesh.is_gfx_inserted){
    mesh.geom.pos[0] += _data[0];
    mesh.geom.pos[1] += _data[1];
  }

  _pt7.Stop();
  
}

function Delete_data(){
  for (let i = 0; i < _groups.length; i++) {
    for (let j = 0; j < _groups[i].length; j++) {
      for (let k = 0; k < _groups[i][j].length; k++) {
        _groups[i][j][k] = [];
        isactive = false;
      }
    }
  }
}
function Log_data(){
  for (let i = 0; i < _groups.length; i++) {
    for (let j = 0; j < _groups[i].length; j++) {
      if(_groups[i][j] !== undefined)
      for (let k = 0; k < _groups[i][j].length; k++) {
        if(_groups[i][j][k] !== undefined)
        for (let l = 0; l < _groups[i][j][k].length; l++) {
          console.log(i,j,k,l,_groups[i][j][k][l].gfx.vb.start,_groups[i][j][k][l].gfx.vb.end);
          // console.log(_groups[i][j][k][l].gfx, _groups[i][j][k][l]);
          // console.log(_groups[i][j][k][l]);
        }
      }
    }
  }
  // console.log(_groups);
}

export function BatchDoWithMerge() {

  if (isactive) {

    // console.log('-------------------------- Batch')
    // Log_data();
    // console.log('--------------------------');

    // Run for each program i:group, j:program, k:vertex buffer, l:mesh.
    const c1=_groups.length;
    for (let i = 0; i < c1; i++) {
      const c2=_groups[i].length;
      for (let j = 0; j < c2; j++) {
        const c3=_groups[i][j].length;
        for (let k = 0; k < c3; k++) {

          // Merge all meshes that are continuous in the vertex buffer, in an array of starts and ends. 
          const merged = [];

          const c4=_groups[i][j][k].length;
          for (let l = 0; l < c4; k++) {

            const data = {
              attribsPerVertex:_groups[i][j][k][l].gfx.attribsPerVertex,
              start:_groups[i][j][k][l].gfx.vb.start,
              end:_groups[i][j][k][l].gfx.vb.end,
              data:{
                col:null,
                pos:_groups[i][j][k][l].pos,
                dim:null,
              },
            };
            // GlVbBatch(_groups[i][j][k][l]);
            // GlVbBatch({
              
            //   data:{
            //     groupidx:_groups[i][j][k][l].gfx.prog.groupidx,
            //     progidx:_groups[i][j][k][l].gfx.prog.idx,
            //     vbidx:_groups[i][j][k][l].gfx.vb.idx,
            //     attribsPerVertex:_groups[i][j][k][l].gfx.attribsPerVertex,
            //     start:_groups[i][j][k][l].gfx.vb.start,
            //     end:_groups[i][j][k][l].gfx.vb.end,
            //     data:{
            //       col:null,
            //       pos:_groups[i][j][k][l].pos,
            //       dim:null,
            //       // and the rest 
            //     },
            //   },
            // });
          }

          // merged.push(data);
          // 
          GlVbBatch(merged, i, j, k);
        }
      }
    }

    // GlSetColorBatch(_groups, Mult_arr4_scalar2(GREY1, 1.4));
    // GlSetColorBatch(_groups, Mult_arr4_scalar2(GREY1, 1.4));
    TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.BATCH_MOVE++;

    Delete_data();
  }
}

export function BatchDoNoMerge2() {

  if (isactive) { // HOT-PATH

    // console.log('-------------------------- Batch')
    // Log_data();
    // console.log('--------------------------');

    // Run for each program i:group, j:program, k:vertex buffer, l:mesh.
    const c1=_groups.length;
    for (let i = 0; i < c1; i++) {
      const c2=_groups[i].length;
      for (let j = 0; j < c2; j++) {

        const c3=_groups[i][j].length;
        for (let k = 0; k < c3; k++) {
          
          if(_groups[i][j][k] !== undefined){
            
            // Merge all meshes that are continuous in the vertex buffer, in an array of starts and ends. 
            const merged = [];
            let attribs_per_vertex = INT_NULL;
            
            const c4=_groups[i][j][k].length;
            for (let l = 0; l < c4; l++) {

              attribs_per_vertex = _groups[i][j][k][l].gfx.attribsPerVertex;
  
              if(_groups[i][j][k][l] !== undefined){
                const mesh = {
                  start:_groups[i][j][k][l].gfx.vb.start,
                  end:_groups[i][j][k][l].gfx.vb.end,
                  data:{
                    col:null,
                    pos:_groups[i][j][k][l].pos,
                    dim:null,
                  },
                };
    
                merged.push(mesh); // Data store is for each mesh.
              }
            }
  
            // Send to gfx for update
            if(merged.length)
              GlVbBatch(merged, merged.length, i, j, k, attribs_per_vertex); // [0]: Any mesh of the same vertex buffer has the same 'attribsPerVertex'.
          }
        }
      }
    }

    // GlSetColorBatch(_groups, Mult_arr4_scalar2(GREY1, 1.4));
    // GlSetColorBatch(_groups, Mult_arr4_scalar2(GREY1, 1.4));
    TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.BATCH_MOVE++;

    Delete_data();
  }
}


export function BatchDoNoMerge() {

  if (isactive) {

    // console.log('-------------------------- Batch')
    // Log_data();
    // console.log('--------------------------');

    // GlSetColorBatch(_groups, Mult_arr4_scalar2(GREY1, 1.4));
    GlSetColorBatch(_groups, Mult_arr4_scalar2(GREY1, 1.4));
    TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.BATCH_MOVE++;

    Delete_data();
  }
}

function Merge2() {


  // Assuming the arr is sorted
  for (let i = 0; i < _groups.length; i++) {
    for (let j = 0; j < _groups[i].length; j++) {
      for (let k = 0; k < _groups[i][j].length; k++) {
        _groups[i][j][k] = null;
        isactive = false;
      }
    }
  }

}
function Merge() {


  // Assuming the arr is sorted
  for (let i = 0; i < _groups.length; i++) {
    for (let j = 0; j < _groups[i].length; j++) {
      for (let k = 0; k < _groups[i][j].length; k++) {
        _groups[i][j][k] = null;
        isactive = false;
      }
    }
  }

}


// function SortBatch() {

//   const a = []; // SEE ## a

//   for (let i = 0; i < _groups.length; i++) {

//     const gfx = _groups[i].gfx;
//     const progidx = gfx.prog.idx;
//     const vbidx = gfx.vb.idx;

//     if (!a[progidx])
//       a[progidx] = new Array()

//     if (!a[progidx][vbidx])
//       a[progidx][vbidx] = new Array()

//     a[progidx][vbidx].push({
//       // num_faces:_groups[i].num_faces,
//       // attribsPerVertex:gfx.attribsPerVertex,
//       // vertsPerRect:gfx.vertsPerRect,
//       groupidx: 0,
//       progidx: progidx,
//       vbidx: vbidx,
//       start: gfx.vb.start,
//       end: gfx.vb.end,
//     });

//     counter++;
//   }
//   // console.log(a)

//   return a;

// }

// function Merge(arr) {

//   if (arr === undefined)
//     console.log
//   // Assuming the arr is sorted
//   for (let i = 0; i < arr.length - 1; i++) {

//     if (arr[i]) {

//       const end = arr[i].end;
//       const start2 = arr[i + 1].start;

//       if (end >= start2) {
//         console.log(' end:', end, ' start2:', start2)
//         arr[i + 1].start = arr[i].start;
//         arr[i] = null;
//       }
//     }
//   }

//   // console.log(arr)

//   return arr;
// }



// function sort_based_on_2_

/*************************************************************************************************/
