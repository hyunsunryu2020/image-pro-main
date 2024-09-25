// Convert the onnx model mask prediction to ImageData
function arrayToImageData(input: any, width: number, height: number) {
    const [r, g, b, a] = [0, 114, 189, 255]; // the masks's blue color
    const arr = new Uint8ClampedArray(4 * width * height).fill(0);
    for (let i = 0; i < input.length; i++) {
  
      // Threshold the onnx model mask prediction at 0.0
      // This is equivalent to thresholding the mask using predictor.model.mask_threshold
      // in python
      if (input[i] > 0.0) {
        arr[4 * i + 0] = r;
        arr[4 * i + 1] = g;
        arr[4 * i + 2] = b;
        arr[4 * i + 3] = a;
      }
    }
    return new ImageData(arr, height, width);
  }
  
  // Use a Canvas element to produce an image from ImageData
  function imageDataToImage(imageData: ImageData) {
    const canvas = imageDataToCanvas(imageData);
    const image = new Image();
    image.src = canvas.toDataURL();
    return image;
  }
  
  // Canvas elements can be created from ImageData
  function imageDataToCanvas(imageData: ImageData) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx?.putImageData(imageData, 0, 0);
    return canvas;
  }

  export function applyMaskToImage(originalImage: HTMLImageElement, maskImage: HTMLImageElement): HTMLImageElement {
    // Create a canvas element with the same dimensions as the images
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
  
    // Draw the mask image onto the canvas
    ctx.drawImage(maskImage, 0, 0);
  
    // Get the pixel data from the mask image
    const maskImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    // Draw the original image onto the canvas
    ctx.drawImage(originalImage, 0, 0);
  
    // Get the pixel data from the canvas
    const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    // Iterate through the pixel data and apply the mask
    for (let i = 0; i < maskImageData.data.length; i += 4) {
      const alpha = maskImageData.data[i + 3]; // Alpha value in mask image
  
      // If the alpha value in the mask is 0, make the corresponding pixel in the original image transparent
      if (alpha === 0) {
        originalImageData.data[i + 3] = 0; // Set alpha to fully transparent
      }
    }
  
    // Put the modified pixel data back onto the canvas
    ctx.putImageData(originalImageData, 0, 0);
  
    // Create a new HTMLImageElement from the canvas content
    const maskedImage = new Image();
    maskedImage.src = canvas.toDataURL();
  
    return maskedImage;
	}	
  
  // Convert the onnx model mask output to an HTMLImageElement
  export function onnxMaskToImage(input: any, width: number, height: number) {
    return imageDataToImage(arrayToImageData(input, width, height));
  }


  