/**
 * Takes an image and returns a new image with an altered hue.
 * Generated in part through the use of ChatGPT
 * 
 * @param image the image to be recolored
 * @param hue the degree of hue rotation along the HSL spectrum
 * @returns image with rotated hue values
 */
export default function recolorSpriteSheet(image, hue) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(
        0, 0, canvas.width, canvas.height
    );

    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];

        // Skip transparent pixels
        if (alpha === 0) continue;

        // Convert RGB to HSL
        let r = pixels[i] / 255;
        let g = pixels[i + 1] / 255;
        let b = pixels[i + 2] / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lightness = (max + min) / 2;

        let h = 0;
        let s = 0;

        if (max !== min) {
            const delta = max - min;

            s = delta / (
                1 - Math.abs(2 * lightness - 1)
            );

            switch (max) {
                case r:
                    h = 60 * (((g - b) / delta) % 6);
                    break;
                case g:
                    h = 60 * ((b - r) / delta + 2);
                    break;
                case b:
                    h = 60 * ((r - g) / delta + 4);
                    break;
            }
        }

        // Replace hue, preserving saturation and lightness
        h = hue / 360;

        // Convert HSL back to RGB
        const c = (1 - Math.abs(2 * lightness - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = lightness - c / 2;

        let rr, gg, bb;

        if (h < 1/6)      [rr, gg, bb] = [c, x, 0];
        else if (h < 2/6) [rr, gg, bb] = [x, c, 0];
        else if (h < 3/6) [rr, gg, bb] = [0, c, x];
        else if (h < 4/6) [rr, gg, bb] = [0, x, c];
        else if (h < 5/6) [rr, gg, bb] = [x, 0, c];
        else              [rr, gg, bb] = [c, 0, x];

        pixels[i]     = Math.round((rr + m) * 255);
        pixels[i + 1] = Math.round((gg + m) * 255);
        pixels[i + 2] = Math.round((bb + m) * 255);
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas;
}
