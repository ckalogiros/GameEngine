import { GlProgram, GlProgramUpdateUniformProjectionMatrix } from '../../../Graphics/GlProgram.js';
import { GetSign } from '../../../Helpers/Helpers.js';
import { Mat4Orthographic, Mat4Perspective } from '../../../Helpers/Math/Matrix.js';
import { MouseGetMousePos, MouseGetPosDif, MouseGetWheel } from '../../Controls/Input/Mouse.js';
import { Matrix4 } from '../../math/Matrix4.js';

/**
 * TODO:
 * 
 * Create a camera enabling system for controling the camera.
 * OnCameraUpdate all the anabled controls must be updated(Matrix arithmetic, translation, rotation, ...etc)
 * Also on camera update we must set the needUpdate of the glProgram that uses the current camera object,
 * so at a later render stage the update of the projection matrix uniform will be updated 
 * in a loop for all programs if needUpdate is true.
 * 
 * 
 */

let _cnt = 1;
export const CAMERA_CONTROLS = {
	PAN: _cnt++,
	ROTATE: _cnt++,
	ZOOM: _cnt++,

	NONE: 0,
	COUNT: _cnt,
};


export class Camera extends Matrix4 {

	isSet; // To debug if camera has been created properly.
	gfxBuffer; // Store all gl programs that the camera apllies to.
	controller;

	constructor() {
		super();
		this.isSet = false;
		this.controller = {
			controls: new Uint8Array(CAMERA_CONTROLS.COUNT),
			isActive: false,
		}
		this.gfxBuffer = [];
		
	}

	Update(gl) {
		if (DEBUG.CAMERA && !this.isSet) alert('Forget to set Camera. @ Camera.js');

		if(!this.controller.isActive) return; // Skip any proccess if camera controls aren't activated.
		if(this.controller.controls[CAMERA_CONTROLS.PAN]){
			this.Pan();
		}
		if(this.controller.controls[CAMERA_CONTROLS.PAN]){
			this.Zoom();
		}

		this.UpdateProjectionUniform(gl);
	}
	UpdateProjectionUniform(gl){
		// Update proj matrix for all gl programs
		const len = this.gfxBuffer.length;
		for(let i=0; i<len; i++){
			GlProgramUpdateUniformProjectionMatrix(gl, this.gfxBuffer[i], this.elements);
		}
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Camera controls
	SetControls(which) {
		
		if (Array.isArray(which)) {
			const count = which.length;
			for (let i = 0; i < count; i++) {
				this.controller.controls[which[i]] = true;
				this.controller.isActive = true;
			}
		}
		else {
			this.controller.controls[which] = true;
			this.controller.isActive = true;
		}
	}

	Pan() {
		const mouseDif = MouseGetPosDif();
		mouseDif.x /= Viewport.width / 2;
		mouseDif.y /= Viewport.height / 2;
		this.Translate(mouseDif.x, mouseDif.y, 0);
	}
	Zoom() {
		const mouseWheel = MouseGetWheel();
		this.Translate(0, 0, mouseWheel.delta);
		// console.log(this.elements[14])
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Matrix transformations
	Translate(x, y, z) {
		super.Translate(x, y, z);
	}

	StoreProgIdx(progIdx) { // This is the way for a camera to be updated(as a uniform mat4) in all gl programs. 

		// Check if the glVertexBuffer index of the current Mesh is already stored in the buffer.
		let found = false;
		const len = this.gfxBuffer.length;

		for (let i = 0; i < len; i++) {
			if (this.gfxBuffer[i] === progIdx) {
				found = true;
				break;
			}
		}

		// Store it, if not stored.
		if (!found) {
			this.gfxBuffer.push(progIdx);
		}
	}
}

export class CameraOrthographic extends Camera {
	constructor() {
		super();
	}
	Set() {
		this.makeOrthographic(0, Viewport.width, 0, Viewport.height, -1000, 1000);
		if(DEBUG.CAMERA) console.log('Orthographic Camera:', this.elements);
		this.isSet = true;
	}
}
export class CameraPerspective extends Camera {
	constructor() {
		super();
	}
	Set() {
		this.makePerspective(0, Viewport.width, 0, Viewport.height, -1000, 1000);
		if(DEBUG.CAMERA) console.log('Perspective Camera:', this.elements)
		this.isSet = true;
	}
}

export function CameraStoreProgramIdx(progIdx){

}