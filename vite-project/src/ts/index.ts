import type {ImageFormat,ImageOptions,DownloadLink} from './types/index'
import { setImageSrc } from './composables/useSetImage';
import buffer from '../assets/imgs/buffer.png'
document.addEventListener('DOMContentLoaded',() => {
    /// Объявлния
    const acceptSize = document.querySelector('#apply-size') as HTMLButtonElement
    const formatSelect = document.querySelector('#image-format') as HTMLSelectElement
    const controlBtnBlock = document.querySelector('.control-btn') as HTMLElement;
    const widthControl = document.querySelector('#width-input') as HTMLInputElement;
    const heightControl = document.querySelector('#height-input') as HTMLInputElement;
    const outputImage = document.querySelector('#output-image') as HTMLImageElement;
    const linkInput = document.querySelector('#image-url') as HTMLInputElement;
    const downloadLink = document.querySelector('#load-url') as HTMLButtonElement;
    
    let imgOpitons:ImageOptions = {
        link:outputImage.src,
        width:Number(widthControl.value),
        height:Number(heightControl.value),
        format:'image/png'
    }
     imgOpitons  = new Proxy(imgOpitons, {
        get(target,prop:keyof ImageOptions){
            if(prop in target){
                return target[prop]
            }
        },
        set(target,prop:keyof ImageOptions,newValue:number | ImageFormat | string){
            switch(prop){
                case 'link':
                    if(typeof newValue === 'string'){
                        if(target[prop].includes('blob')){
                            URL.revokeObjectURL(target[prop])
                        }
                        if(newValue === ''){
                            controlBtnBlock.style.display = 'none'
                            outputImage.src = buffer
                            return true
                        }
                        controlBtnBlock.style.display = 'block'
                        outputImage.onload = function(){
                            imgOpitons.width = outputImage.naturalWidth;  
                            imgOpitons.height = outputImage.naturalHeight; 
                        }
                        outputImage.src = newValue
                        return true
                    }
                    break;
                case 'width':
                    if(typeof newValue === 'number'){
                        widthControl.value = String(newValue)
                    }
       
                    break;
                case 'height':
                  if(typeof newValue === 'number'){
                    heightControl.value = String(newValue)
                  }
                    break;
                case 'format':
                    if(typeof newValue !== 'number'){
                        formatSelect.value = newValue
                    }
                    break;
            }
            target[prop] = newValue as never
            return true
        }
    })
    /// Работа с файлом
    const fileInput = document.querySelector('#upload') as Element
    fileInput.addEventListener("change" , (event) => {
        if(linkInput.value){
            linkInput.value = ''
        }
        const target = event.target as HTMLInputElement
        if(target.files){
            const file:File = target.files[0];
            setImageSrc(imgOpitons,file);
            
        }   
    })
    /// Работа с шириной и высотой
    widthControl.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement
        imgOpitons.width = Number(target.value)
    })
    heightControl.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement
        imgOpitons.height = Number(target.value)
    })    

    // Изменение размеров
    acceptSize.addEventListener('click', (e) => {
        e.preventDefault()
        const downloadBuffer = document.querySelector('#accept') as DownloadLink 
        const {width,height} = imgOpitons;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.drawImage(
            outputImage,        
            0, 0,             
            outputImage.naturalWidth, outputImage.naturalHeight, 
            0, 0,           
            canvas.width, canvas.height 
          );
        
        const canvasUrl =  canvas.toDataURL(imgOpitons.format);
        const downloadName = `Resized-${outputImage.alt.split('.')[0]}`
        downloadBuffer.href = canvasUrl     
        downloadBuffer.download = downloadName  
        downloadBuffer.click();
        imgOpitons.link = '';
        linkInput.value = '';
        outputImage.removeAttribute('width');
        outputImage.removeAttribute('height');
    })
    // Работа с ссылкой
    downloadLink.addEventListener('click', async () => {
        let link = linkInput.value;
        if(link.length === 0) return alert('Введите ссылку')
        try{
            const response = await fetch(link);
            const file = await response.blob();
            if(!file.type.includes('image')){
                throw new Error('Введите валидную ссылку');
            }
            setImageSrc(imgOpitons,file)
        }catch(error){
            if(error instanceof Error){
                if(error.message === 'Введите валидную ссылку'){
                    return alert('Введите валидную ссылку')
                }
            }
        console.error(error)  
        }

    })
    /// Работа с форматом данных
    formatSelect.addEventListener('change', (e) => {
        const option = e.target as HTMLOptionElement;
        imgOpitons.format = option.value as ImageFormat;
    })
})