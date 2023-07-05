"use strict";

import { Geometry2D } from "./Geometry.js";

let _object3DId = 0;
let _modelId = 0;

class Model2D extends Geometry2D{
	constructor(pos, dim, scale) {

		super(pos, dim, scale);

		// this.isObject3D = true;
		// this.parent = null;
		// this.children = [];
		// this.matrix = new Matrix4();
		// this.matrixWorld = new Matrix4();
		// this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
		// this.matrixWorldNeedsUpdate = false;
		// this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE; // checked by the renderer
		// this.layers = new Layers();
		// this.visible = true;
		// this.castShadow = false;
		// this.receiveShadow = false;
		// this.frustumCulled = true;
		// this.renderOrder = 0;
		// this.animations = [];
		// this.userData = {};


		/** Debug properties */
		if(DEBUG.MATERIAL){
			Object.defineProperty( this, 'id', { value: _modelId++ } );
			Object.defineProperty( this, 'type', { value: 'Model' } );
		}
   }
}