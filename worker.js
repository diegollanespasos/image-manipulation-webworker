"use strict";

const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;

let originalPixels = null;
let srcImageWidth = null;
let srcImageHeight = null;
let currentPixels = [];

function getIndex(x, y){
    return (x + y * srcImageWidth) * 4;
}

function clamp(value) {
    return Math.max(0, Math.min(Math.floor(value), 255));
}

function addColor(x, y, value, colorOffset) {
    const index = getIndex(x, y) + colorOffset;
    const currentValue = currentPixels[index];
    currentPixels[index] = clamp(currentValue + value);
}

function addBrightness(x, y, value) {
    addColor(x, y, value, R_OFFSET) //Red
    addColor(x, y, value, G_OFFSET) //Green
    addColor(x, y, value, B_OFFSET) //Blue
}

function addGrayscale(x, y) {
    const redIndex = getIndex(x, y) + R_OFFSET
    const greenIndex = getIndex(x, y) + G_OFFSET
    const blueIndex = getIndex(x, y) + B_OFFSET
  
    const redValue = currentPixels[redIndex]
    const greenValue = currentPixels[greenIndex]
    const blueValue = currentPixels[blueIndex]
  
    const mean = (redValue + greenValue + blueValue) / 3
  
    currentPixels[redIndex] = clamp(mean)
    currentPixels[greenIndex] = clamp(mean)
    currentPixels[blueIndex] = clamp(mean)
}

function processImage(callback) {
    currentPixels = originalPixels.slice();

    switch(callback.name){
        case 'addBrightness':
            for(let i = 0; i < srcImageHeight; i++){
                for(let j = 0; j < srcImageWidth; j++){
                    callback(j, i, 120);
                }
            }
            break;

        case 'addGrayscale':
            for(let i = 0; i < srcImageHeight; i++){
                for(let j = 0; j < srcImageWidth; j++){
                    callback(j, i);
                }
            }
            break;
        
        case 'addColor':
            for(let i = 0; i < srcImageHeight; i++){
                for(let j = 0; j < srcImageWidth; j++){
                    callback(j, i, 100, G_OFFSET);
                }
            }
            break;

        default:
            break;
    }

    postMessage(currentPixels);
}


onmessage = function(event) {
    srcImageWidth = event.data[1];
    srcImageHeight = event.data[2];
    originalPixels = event.data[3];

    if(event.data[0] === 'brightnessFilter'){
        processImage(addBrightness);
    } else if(event.data[0] === 'grayscaleFilter'){
        processImage(addGrayscale);
    } else if(event.data[0] === 'greenFilter'){
        processImage(addColor);
    }
}