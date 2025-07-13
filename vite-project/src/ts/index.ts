interface ImageOptions  {
    width:string | number,
    height:string | number
}

interface DownloadLink extends HTMLLIElement{
    download:string,
    href:string | URL 
}
document.addEventListener('DOMContentLoaded',() => {
    /// Объявлния
    const acceptSize = document.querySelector('#apply-size') as HTMLButtonElement
    const accept = document.querySelector('#accept') as DownloadLink
    const controlBtnBlock = document.querySelector('.control-btn') as HTMLElement;
    const widthControl = document.querySelector('#width-input') as HTMLInputElement;
    const heightControl = document.querySelector('#height-input') as HTMLInputElement;
    const outputImage = document.querySelector('#output-image') as HTMLImageElement;
    const linkInput = document.querySelector('#image-url') as HTMLInputElement;
    const downloadLink = document.querySelector('#load-url') as HTMLButtonElement;
    const imageTarget:ImageOptions = {
        width:widthControl.value,
        height:heightControl.value
    }

    const proxyImage = new Proxy(outputImage, {
        get(target:typeof outputImage,prop:keyof typeof outputImage){
            if(prop in target){
                return target[prop]
            }
        },
        set(target:typeof outputImage,prop:keyof typeof outputImage, value:string){
            if(prop === 'width' || prop === 'height'){
                target[prop] = Number(value)
            }
            if(prop === 'src'){
                if(value === ''){
                    controlBtnBlock.style.display = 'none'
                    target[prop] = value
                    return true
                }
                controlBtnBlock.style.display = 'block'
                target.onload =  function() {  
                    imgOpitons.width = outputImage.naturalWidth;  
                    imgOpitons.height = outputImage.naturalHeight; 

                  };
                target[prop] = value
         
            }
            if(prop === 'alt'){
                if(value === ''){
                    target[prop] = 'Загруженное изображение'
                    return true
                }
                target[prop] = value
            }
            return true
        }
    })
    const imgOpitons  = new Proxy(imageTarget, {
        get(target,prop:keyof ImageOptions){
            if(prop in target){
                return target[prop]
            }
        },
        set(target,prop:keyof ImageOptions,newValue:number){
            switch(prop){
                case 'width':
                    widthControl.value = String(newValue)
                    proxyImage.width = newValue
                    break;
                case 'height':
                    heightControl.value = String(newValue)
                    proxyImage.height = newValue
                    break;
            }
            target[prop] = newValue;
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
            const url = URL.createObjectURL(file)     
            proxyImage.src = url;
            proxyImage.alt = target.files[0].name
        }   
    })

    /// Работа с шириной и высотой
    widthControl.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement
        proxyImage.width = Number(target.value)
    })
    heightControl.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement
        proxyImage.height = Number(target.value)
    })    

    // Изменение размеров
    acceptSize.addEventListener('click', (e) => {
        e.preventDefault()
        const {width,height} = outputImage;
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
        
         const canvasUrl =  canvas.toDataURL('image/png');
          const downloadName = `Resized-${outputImage.alt.split('.')[0]}`
        accept.href = canvasUrl  
        accept.download = downloadName  
        accept.click();
        proxyImage.alt = '';
        proxyImage.src = '';
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
            console.log(response.headers)
            const bloblLink = await response.blob();
            if(!bloblLink.type.includes('image')){
                throw new Error('Введите валидную ссылку');
            }
            const imgUrl = URL.createObjectURL(bloblLink);
            proxyImage.src = imgUrl
        }catch(error){
            if(error instanceof Error){
                if(error.message === 'Введите валидную ссылку'){
                    return alert('Введите валидную ссылку')
                }
            }
        console.error(error)  
        }

    })
})