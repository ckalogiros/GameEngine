"use strict";

class Geometry2D{
   
   pos   = [0, 0, 0];
   dim   = [0, 0];
   scale = [0, 0];

   constructor(pos, dim, scale) {

      math.CopyArr3(this.pos, pos);
      math.CopyArr2(this.dim, dim);
      math.CopyArr2(this.scale, scale);

      // Keep a copy of the starting dimention and position
      math.CopyArr2(this.defDim, dim);
      math.CopyArr2(this.defScale, scale);
      math.CopyArr3(this.defPos, pos);
   }
   SetPos(pos) {
       math.CopyArr2(this.mesh.pos, pos);
       GlSetWposXY(this.gfxInfo, pos);
   }
   UpdatePosXY() {
       GlSetWposXY(this.gfxInfo, this.mesh.pos);
   }
   SetPosXY(pos) {
       math.CopyArr2(this.mesh.pos, pos);
       GlSetWposXY(this.gfxInfo, pos);
   }
   SetPosX(x) {
       this.mesh.pos[0] = x;
       GlSetWposX(this.gfxInfo, x);
   }
   SetPosY(y) {
       this.mesh.pos[1] = y;
       GlSetWposY(this.gfxInfo, y);
   }
   SetZindex(z) {
       this.mesh.pos[2] = z;
       GlSetWposZ(this.gfxInfo, z);
   }
   Move(x, y) {
       this.mesh.pos[0] += x;
       this.mesh.pos[1] += y;
       GlMove(this.gfxInfo, [x, y]);
   }
   MoveX(x) {
       this.mesh.pos[0] += x;
       GlMove(this.gfxInfo, [x, 0]);
   }
   MoveY(y) {
       this.mesh.pos[1] += y;
       GlMove(this.gfxInfo, [0, y]);
   }
   SetDim(dim) {
       math.CopyArr2(this.mesh.dim, dim);
       GlSetDim(this.gfxInfo, dim);
   }
   Shrink(val) {
       this.mesh.dim[0] *= val;
       this.mesh.dim[1] *= val;
       GlSetDim(this.gfxInfo, this.mesh.dim);
   }
   UpdateScale() {
       GlSetScale(this.gfxInfo, this.mesh.scale);
   }
   SetScale(s) {
       this.mesh.scale[0] *= s;
       this.mesh.scale[1] *= s;
       GlSetScale(this.gfxInfo, this.mesh.scale);
   }
   ScaleFromVal(val) {
       this.mesh.scale[0] *= val;
       this.mesh.scale[1] *= val;
       GlSetScale(this.gfxInfo, this.mesh.scale);
       // Also set dim to mirror the scale
       this.mesh.dim[0] *= val;
       this.mesh.dim[1] *= val;
   }
   StoreDefPos(pos) {
       math.CopyArr2(this.mesh.defPos, pos);
   }

}