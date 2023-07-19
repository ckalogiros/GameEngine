"use strict";


export class ImageLoader{

   static Load(imgPath, imgName, imgType){
      const image = new Image();
      const src = `${RESOURCES_PATH}/${imgPath}/${imgName}.${imgType}`;
      image.src = src;
      return image;
   }

}