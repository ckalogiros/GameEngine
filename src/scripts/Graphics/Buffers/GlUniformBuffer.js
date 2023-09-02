"use strict";

import { GlUseProgram } from "./GlBuffers.js";

export class Uniform {

   val;
   loc;
   Update;
   
   constructor(val = null, loc = null, type = null) {

      this.val = val;// Uniform value
      this.loc = loc; // Uniform Location
      this.Update = null; // Function

      switch (type) {
         // From THREE.js
         case UNIF_TYPE.FLOAT: { this.Update = this.SetValueV1f; break; } // FLOAT
         case UNIF_TYPE.FVEC2: { this.Update = this.SetValueV2f; break; } // F_VEC2
         case UNIF_TYPE.FVEC3: { this.Update = this.SetValueV3f; break; } // F_VEC3
         case UNIF_TYPE.FVEC4: { this.Update = this.SetValueV4f; break; } // F_VEC4

         case UNIF_TYPE.MAT2: { this.Update = this.SetValueM2; break; } // F_MAT2
         case UNIF_TYPE.MAT3: { this.Update = this.SetValueM3; break; } // F_MAT3
         case UNIF_TYPE.MAT4: { this.Update = this.SetValueM4; break; } // F_MAT4

         case UNIF_TYPE.INT: { this.Update = this.SetValueV1i; break; } // INT, BOOL
         case UNIF_TYPE.BOOL: { this.Update = this.SetValueV1i; break; } // INT, BOOL
         case UNIF_TYPE.IVEC2: { this.Update = this.SetValueV2i; break; } // I_VEC2
         case UNIF_TYPE.IVEC3: { this.Update = this.SetValueV3i; break; } // I_VEC3
         case UNIF_TYPE.UIVEC4: { this.Update = this.SetValueV4i; break; } // I_VEC4

         case UNIF_TYPE.UINT: { this.Update = this.SetValueV1ui; break; } // UINT
         case UNIF_TYPE.UIVEC2: { this.Update = this.SetValueV2ui; break; } // UI_VEC2
         case UNIF_TYPE.UIVEC3: { this.Update = this.SetValueV3ui; break; } // UI_VEC3
         case UNIF_TYPE.UIVEC4: { this.Update = this.SetValueV4ui; break; } // UI_VEC4

         default: { console.error('The type of the uniform\'s value is unknown'); break; }

      }
   }

   Set(val) {
      this.val = val;
      // this.needsUpdate = true;
   }
   Update(gl, val) {
      this.Update(gl, val);
      // this.needsUpdate = false;
   }

   // Array of scalars
   SetValueV1f(gl) { gl.uniform1fv(this.loc, this.val); }
   // Array of vectors (from flat array or array of THREE.VectorN)
   SetValueV2f(gl) { gl.uniform2fv(this.loc, this.val); }
   SetValueV3f(gl) { gl.uniform3fv(this.loc, this.val); }
   SetValueV4f(gl) { gl.uniform4fv(this.loc, this.val); }
   // Array of matrices (from flat array or array of THREE.MatrixN)
   SetValueM2(gl) { gl.uniformMatrix2fv(this.loc, false, this.val); }
   SetValueM3(gl) { gl.uniformMatrix3fv(this.loc, false, this.val); }
   SetValueM4(gl) { gl.uniformMatrix4fv(this.loc, false, this.val); }
   // Array of integer / boolean
   SetValueV1i(gl) { gl.uniform1iv(this.loc, this.val); }
   // Array of integer / boolean vectors (from flat array)
   SetValueV2i(gl) { gl.uniform2iv(this.loc, this.val); }
   SetValueV3i(gl) { gl.uniform3iv(this.loc, this.val); }
   SetValueV4i(gl) { gl.uniform4iv(this.loc, this.val); }
   // Array of unsigned integer
   SetValueV1ui(gl) { gl.uniform1uiv(this.loc, this.val); }
   // Array of unsigned integer vectors (from flat array)
   SetValueV2ui(gl) { gl.uniform2uiv(this.loc, this.val); }
   SetValueV3ui(gl) { gl.uniform3uiv(this.loc, this.val); }
   SetValueV4ui(gl) { gl.uniform4uiv(this.loc, this.val); }
}

export class UniformsBuffer {
   
   ub;
   names; // A way to get a specific uniforms index.
   count;
   loc;
   needsUpdate;

   constructor(gl, prog, size) {
      this.needsUpdate = false;
      this.count = 0;

      GlUseProgram(prog.webgl_program, prog.idx)
      this.loc = gl.getUniformLocation(prog.webgl_program, 'uniforms_buffer');
      if (!this.loc) {
         // console.error('Could not locate uniform: \'uniforms_buffer\'');
         this.ub = null;
         this.names = null;
      }
      else {
         this.ub = new Float32Array(size);
         this.names = [];
         console.log('Uniform: \'uniforms_buffer\' located successfully!')
      }
   }

   CreateUniform(name) {
      const idx = this.count++;
      this.names[idx] = name;
      return idx;
   }

   Set(value, index) {
      this.ub[index] = value;
      this.needsUpdate = true;
   }

   Update(gl) {
      gl.uniform1fv(this.loc, this.ub); // And the shader decides the number of elements to draw from the buffer
      this.needsUpdate = false;
   }
}