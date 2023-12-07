"use strict";

const DBG = false;
/**
 * // IMPORTANT: Implement search of parents children children.
 * Case: 
 *    1. section -> has section -> has label. This text mesh alocates a new vertex buffer 
 *    2. section -> has section -> has label. This text must use the text gfx buffer of the previous sections label widget
 *    So instead of only searching parent's children, we must:
 *    After searching all parent's children,
 *    going up all the parens tree, if still no buffer found,
 *    we must search each parent's children down the tree (very inefficient)
 * 
 *    Another much faster way could be:
 *    Find any vertex matching vertex buffer that is inUse, and check if any of the meshes
 *    belonging to the vertex buffer, have common ancestor with the mesh we want to generate the gfx context for.
 */
const RECT_FOUND = 0x1;
const TEXT_FOUND = 0x2;



export function Find_gfx_from_parent_ascend_descend(mesh, parent, _gfxidxs=null, temp) {

   if (DBG && !temp) console.log('\n\n-- NEW FUNCTION CALL --')

   let gfxidxs = {

      text: {
         idxs: [INT_NULL, INT_NULL],
         FLAGS: GFX_CTX_FLAGS.NEW, // If no matching vertex buffer found, new buffer must be created
      },
      rect: {
         idxs: [INT_NULL, INT_NULL],
         FLAGS: GFX_CTX_FLAGS.NEW, // If no matching vertex buffer found, new buffer must be created
      }
   }

   let done = 0x0;

   // Carry any already found matches.
   if(_gfxidxs && _gfxidxs.rect.idxs[0] !== INT_NULL){
      gfxidxs.rect = _gfxidxs.rect;
      done |= RECT_FOUND;
   }
   if(_gfxidxs && _gfxidxs.text.idxs[0] !== INT_NULL){
      gfxidxs.text = _gfxidxs.text;
      done |= TEXT_FOUND;
   }

   if (parent) {


      // First check if parent sid matches the mesh's sid. 
      // NOTE: To avoid: the first child always create a new vertex buffer, although it could use the parent's vertex buffer. 
      if (!(done & RECT_FOUND) && SID.CheckSidMatch(mesh.sid, parent.sid)) {
         gfxidxs.rect.idxs[0] = parent.gfx.prog.idx;
         gfxidxs.rect.idxs[1] = parent.gfx.vb.idx;
         gfxidxs.rect.FLAGS = GFX_CTX_FLAGS.SPECIFIC;
         done |= RECT_FOUND;

         if (!(done & TEXT_FOUND) && mesh.text_mesh && parent.text_mesh) { // Case the parent has a text mesh, use that gfx buffers
            gfxidxs.text.idxs[0] = parent.text_mesh.gfx.prog.idx;
            gfxidxs.text.idxs[1] = parent.text_mesh.gfx.vb.idx;
            gfxidxs.text.FLAGS = GFX_CTX_FLAGS.SPECIFIC;
            done |= TEXT_FOUND;
         }

         if (done & RECT_FOUND && done & TEXT_FOUND) return gfxidxs;
         if (DBG) console.log('123456 . ----------- | mesh:parent', mesh.name, parent.name)
      }

      // Search all parent's children for matching gfx
      for (let i = 0; i < parent.children.boundary; i++) {

         const child = parent.children.buffer[i];

         if (child && child.gfx) {

            // Check for rect gfx
            if (!(done & RECT_FOUND) && SID.CheckSidMatch(mesh.sid, child.sid)) {
               
               gfxidxs.rect.idxs[0] = child.gfx.prog.idx;
               gfxidxs.rect.idxs[1] = child.gfx.vb.idx;
               gfxidxs.rect.FLAGS = GFX_CTX_FLAGS.SPECIFIC;
               done |= RECT_FOUND;
               if (DBG) console.log('0. ----------- | mesh:child', mesh.name, child.name)
            }
         
            // Check for text gfx also
            const ret = Check_for_text_gfx_combinatory(mesh, child);
            gfxidxs.text = ret;

            if (ret.idxs[0] !== INT_NULL) {
               done |= TEXT_FOUND;
               if (ret.isMesh_text_mesh) done |= RECT_FOUND; // NOTE: To avoid the non breaking of the for loop keep searching for the .rect buffers, if the mesh is only text(with no rect))
               if (DBG) console.log(' *** FOUND BUFFERS FOR TEXT:', ret.idxs, '\nmesh:child', mesh.name, child.name)
            }
         }

         // Run depth recursion for any children of child
         if(child.children.boundary){
            gfxidxs = Find_gfx_from_children_descending(mesh, child, gfxidxs, done);
            if (gfxidxs.text.idxs[0] !== INT_NULL) done |= TEXT_FOUND
         }

         if (done & RECT_FOUND && done & TEXT_FOUND)
            break; // If both gfxs are set, no need to continue the loop. 

         // Else continue until all children are checked
      }

      /**
       * If no gfx buffers found in parent OR among parent children, run recursively up the parent tree
       * // NOTE: For menu bar widgets works perfectly fine to store each menu bar in its own buffers. So the recursion up the tree is not necessary.
       */
      if (!(done & RECT_FOUND && done & TEXT_FOUND) && parent.parent) {
         if (DBG) console.log('-- RECURSIVE -- ')
         gfxidxs = Find_gfx_from_parent_ascend_descend(mesh, parent.parent, gfxidxs, true)
         if (DBG) console.log('-- RETURN RECURSIVE -- \n\n')
      }

   }

   /**DEBUG */ if (DBG && gfxidxs.text.idxs[0] === INT_NULL) console.log('NO TEXT BUFFER FOUND. ----------- | mesh:parent', mesh.name, parent.name);
   if(DBG) console.log()

   return gfxidxs;
}

function Find_gfx_from_children_descending(mesh, parent, gfxidxs, done){

   for ( let i=0; i<parent.children.boundary; i++){

      const child = parent.children.buffer[i];

      if (child && child.gfx) {

         // Check for rect gfx
         if (!(done & RECT_FOUND) && SID.CheckSidMatch(mesh.sid, child.sid)) {
            
            gfxidxs.rect.idxs[0] = child.gfx.prog.idx;
            gfxidxs.rect.idxs[1] = child.gfx.vb.idx;
            gfxidxs.rect.FLAGS = GFX_CTX_FLAGS.SPECIFIC;
            done |= RECT_FOUND;
            if (DBG) console.log('DESCENDING FOUND RECT GFX ----------- | mesh:child', mesh.name, child.name)
         }
      
         // Check for text gfx also
         const ret = Check_for_text_gfx_combinatory(mesh, child);
         
         if (ret.idxs[0] !== INT_NULL) {
            gfxidxs.text = ret;
            done |= TEXT_FOUND;
            if (ret.isMesh_text_mesh) done |= RECT_FOUND; // NOTE: To avoid the non breaking of the for loop keep searching for the .rect buffers, if the mesh is only text(with no rect))
            if (DBG) console.log(' *** FOUND BUFFERS FOR TEXT:', ret.idxs, ' mesh:child', mesh.name, child.name);
            break;
         }
         if(child.children.boundary){
            gfxidxs = Find_gfx_from_children_descending(mesh, child, gfxidxs, done);
         }
      }
   }

   return gfxidxs;

}

/**
 * Searches only for text gfx matching.
 * The combinatory nature comes from the fact that: 
 *    some meshes have text mesh as a variable directly in to their class,
 *    and some meshes have text mesh as child in the childrens buffer.
 * So all 4 combinations are checked.
 */
function Check_for_text_gfx_combinatory(mesh, child) {

   const gfxidxs = {
      idxs: [INT_NULL, INT_NULL],
      FLAGS: GFX_CTX_FLAGS.NEW, // If no matching vertex buffer found, new buffer must be created
      isMesh_text_mesh: false,
   }

   // Else check combinations
   if ((child.type & MESH_TYPES_DBG.TEXT_MESH) && ((mesh.type & MESH_TYPES_DBG.TEXT_MESH) || (mesh.type & MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC))) {
      
      if (SID.CheckSidMatch(mesh.sid, child.sid)) {
         gfxidxs.idxs[0] = child.gfx.prog.idx;
         gfxidxs.idxs[1] = child.gfx.vb.idx;
         gfxidxs.FLAGS = GFX_CTX_FLAGS.SPECIFIC;

         gfxidxs.isMesh_text_mesh = true; // NOTE: To avoid the non breaking of the for loop keep searching for the .rect buffers, if the mesh is only text(with no rect)

         if (DBG) console.log('1. ----------- | mesh:child', mesh.name, child.name)
      }
   }
   else if (mesh.text_mesh && (child.type & MESH_TYPES_DBG.TEXT_MESH) && (!(mesh.type & MESH_TYPES_DBG.TEXT_MESH) && !(mesh.type & MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC))) {

      if (SID.CheckSidMatch(mesh.text_mesh.sid, child.sid)) {
         gfxidxs.idxs[0] = child.gfx.prog.idx;
         gfxidxs.idxs[1] = child.gfx.vb.idx;
         gfxidxs.FLAGS = GFX_CTX_FLAGS.SPECIFIC;

         if (DBG) console.log('2. ----------- | mesh:child', mesh.name, child.name)
      }
   }
   else if (child.text_mesh && !(child.type & MESH_TYPES_DBG.TEXT_MESH) && ((mesh.type & MESH_TYPES_DBG.TEXT_MESH) || (mesh.type & MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC))) {

      if (SID.CheckSidMatch(mesh.sid, child.text_mesh.sid)) {
         gfxidxs.idxs[0] = child.text_mesh.gfx.prog.idx;
         gfxidxs.idxs[1] = child.text_mesh.gfx.vb.idx;
         gfxidxs.FLAGS = GFX_CTX_FLAGS.SPECIFIC;

         gfxidxs.isMesh_text_mesh = true; // NOTE: To avoid the non breaking of the for loop keep searching for the .rect buffers, if the mesh is only text(with no rect)

         if (DBG) console.log('3. ----------- | mesh:child', mesh.name, child.name)
      }
   }
   else if (!(child.type & MESH_TYPES_DBG.TEXT_MESH) && (!(mesh.type & MESH_TYPES_DBG.TEXT_MESH) && !(mesh.type & MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC))) {

      if(mesh.text_mesh && child.text_mesh){ // Make sure both meshes have text_mesh variable(may be just a rect mesh like 'section' mesh)

         if (SID.CheckSidMatch(mesh.text_mesh.sid, child.text_mesh.sid)) {
            gfxidxs.idxs[0] = child.text_mesh.gfx.prog.idx;
            gfxidxs.idxs[1] = child.text_mesh.gfx.vb.idx;
            gfxidxs.FLAGS = GFX_CTX_FLAGS.SPECIFIC;
   
            if (DBG) console.log('4. ----------- | mesh:child', mesh.name, child.name)
         }
      }
   }

   return gfxidxs;
}