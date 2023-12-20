"use strict";

import { GlSetColor, GlSetColorBatch } from "../../Graphics/Buffers/GlBufferOps";
import { Mult_arr4_scalar2 } from "../../Helpers/Math/MathOperations";
import { _pt7 } from "../Timers/PerformanceTimers";

const _groups = [];
let _count = 0;
let isactive = false;
let counter = 0;

export function BatchStore(mesh, type, _data) {

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

    // group:i,
    // progidx:j,
    // vbidx:k,
    gfx:[i,j,k],
    start: mesh.gfx.vb.start,
    end: mesh.gfx.vb.end,
    // gfx: mesh.gfx,
    // num_faces: mesh.geom.num_faces,
    type: type,
    // name: mesh.name,
    // id: mesh.id,
    pos:_data,
  }

  _groups[i][j][k].push(data);
  isactive = true;
  
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
          console.log(_groups[i][j][k][l].gfx, _groups[i][j][k][l]);
          // console.log(_groups[i][j][k][l]);
        }
      }
    }
  }
  // console.log(_groups);
}

export function BatchDo() {

  if (isactive) {

    // console.log('-------------------------- Batch')

    // Log_data();

    // GlSetColorBatch(_groups, Mult_arr4_scalar2(GREY1, 1.4));
    GlSetColorBatch(_groups, Mult_arr4_scalar2(GREY1, 1.4));
    TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.BATCH_MOVE++;

    // console.log('--------------------------');
    Delete_data();
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

export function TEMP_move_through_here(x, y, mesh){
  _pt7.Start();
  mesh.geom.MoveXY(x, y, mesh.gfx);
  _pt7.Stop();
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
