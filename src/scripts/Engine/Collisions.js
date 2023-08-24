

/**
 * 
 * @param {*} p An array of 2, as a 2D point. [0]: x coord, [1]: y coord. 
 * @param {*} r An array of 2 of 2, as a 2D rectangle. [0][0]: left, [0][1]: right, [1][0]: top, [1][1]: botto 
 * @returns True for collision. 
 */
export function Intersection_point_rect(p, r){

   if(p[0] > r[0][0] && p[0] < r[0][1] && p[1] > r[1][0] && p[1] < r[1][1])
      return true;

   return false;
}


export function Collision_PointTriangle(p, t){

   // const base = t[0][1] - t[0][0];
   // const height = t[1][1] - t[1][0];
   // const y = height - p[1];
   // const x = (base/2) * y;

   // if(p[0] > t[0][0]-x && p[0] < t[0][1]+x && p[1] > t[1][0] && p[1] < t[1][1]){
   //    console.log('Triangle Collision!')
   //    return true;
   // }
   // return false;
}

export function Check_intersection_point_rect(pos, dim, point, margin = [0,0]){

   const rect = [
       [pos[0]-dim[0]-margin[0], pos[0]+dim[0]+margin[0]],     // Left  Right 
       [pos[1]-dim[1]-margin[1], pos[1]+dim[1]+margin[1]], // Top  Bottom
   ];
   
   return Intersection_point_rect(point, rect);
}