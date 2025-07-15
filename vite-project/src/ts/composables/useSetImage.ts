import type {ImageFormat,ImageOptions} from '../types/index'

export function setImageSrc<T extends Blob>(imgOpitons:ImageOptions,file:T):void{
    const fileImage = new Image()
    fileImage.onload = function(){
        imgOpitons.link = url
        imgOpitons.height =  fileImage.height
        imgOpitons.width = fileImage.width
        imgOpitons.format = file.type as ImageFormat
    }
    const url = URL.createObjectURL(file)    
    fileImage.src = url
}