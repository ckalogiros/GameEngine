"use strict";

/**
 * 
 * @param {BIT_FIELD} flags type of struct ALIGN
 * @param {.geom} src_mesh type of: Geometry2D
 * @param {.geom} dst_mesh type of: Geometry2D
 * @param {arr} pad type of: int arr[2] | default values if not set:[0,0]
 */
export function Align(flags, src_mesh, dst_mesh, pad = [0, 0]) {

    let dst_width = dst_mesh.dim[0];
    // Case the destination mesh is of type text, we calculate the width (Only for RIGHT alingment).
    if (dst_mesh.type & MESH_TYPES_DBG.TEXT_GEOMETRY2D && (flags & ALIGN.RIGHT)) {
        dst_width *= dst_mesh.num_faces * 2;    // Calculate the whole text's width
        dst_width -= dst_mesh.dim[0];          // Center the face to its local space.
    }

    if (flags & (ALIGN.HOR_CENTER|ALIGN.LEFT | ALIGN.RIGHT))
        dst_mesh.pos[0] = Align_pos_hori(flags, src_mesh.pos[0], src_mesh.dim[0], dst_mesh.pos[0], dst_width, pad[0]);
    if (flags & (ALIGN.TOP | ALIGN.BOTTOM))
        dst_mesh.pos[1] = Align_pos_vert(flags, src_mesh.pos[1], src_mesh.dim[1], dst_mesh.pos[1], dst_mesh.dim[1], pad[1]);
}

function Align_pos_hori(flags, src_posx, src_width, dst_posx, dst_width, pad_x) {

    let pos_x = 0;
    if (flags & ALIGN.RIGHT)
        pos_x = (src_posx + src_width) - (dst_width + pad_x);
    else if (flags & ALIGN.LEFT)
        pos_x = (src_posx - src_width) + dst_width + pad_x;
    else pos_x = src_posx; // Default case. Do not return 'pos_x = 0', instead return the original position.
    return pos_x;
}
function Align_pos_vert(flags, src_posy, src_height, dst_posy, dst_height, pad_y) {

    let pos_y = 0;
    if (flags & ALIGN.BOTTOM)
        pos_y = (src_posy + src_height) - (dst_height + pad_y);
    else if (flags & ALIGN.TOP)
        pos_y = (src_posy - src_height) + dst_height + pad_y;
    else pos_y = dst_posy; // Default case. Do not return 'pos_y = 0', instead return the original position.
    return pos_y;
}