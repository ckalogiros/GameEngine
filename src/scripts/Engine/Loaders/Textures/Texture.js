"use strict";

/**
 * For the textures we use a texture atlas.
 * We store all tex coords that the atlas has, in a globallyy accesible buffer.
 * Each mesh may get it's tex coords from the buffer simply by an index,
 * by storing the buffer's coords index in each mesh.
 * 
 * Two implementations.
 *    1. We use an automatic calculation of all textures based upon juust the width 
 *       and the height of each texture, but that suugests that we are gonna have
 *       to separate the atlas into rows of textures. Not very space efficient,
 *       because of the height differences of the textures .
 *    2. We use a table(array) that has hardcoded texture coordinates for each texture in the atlas.
 */

export function AtlasTextureGetCoords(index){
   return ATLAS_TEX_COORDS[index];
}


