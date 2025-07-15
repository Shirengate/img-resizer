type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'
interface ImageOptions  {
    link:string,
    width:number,
    height: number,
    format:ImageFormat
}

interface DownloadLink extends HTMLLIElement{
    download:string,
    href:string | URL 
}
export type {ImageFormat,ImageOptions,DownloadLink}