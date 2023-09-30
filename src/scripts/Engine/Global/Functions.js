"use strict";


export function Destroy_mesh(mesh){

   mesh.Destroy();
   mesh = null;
   return mesh;
}