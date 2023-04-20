import React, { useState, useRef, useEffect, useCallback } from "react";
import { TestDrawProps } from "./MemeGenerator.test";

const MAX_WIDTH = 480;

const urlRegx = new RegExp(
  `^((https?|ftp):)?(\/\/)?((www|m)\\.)?((\\w+\\.)+\\w+)`
);
const imageBase64Regx = new RegExp(`^data:image\\/(png|jpg|jpeg);base64,`);

const MemeGenerator = ({
  testDrawFunction,
}: {
  testDrawFunction?: (props: TestDrawProps) => void;
}) => {
  const [imageURL, setImageURL] = useState<string>("");
  const [textTop, setTextTop] = useState<string>("");
  const [textBottom, setTextBottom] = useState<string>("");
  const [textColor, setTextColor] = useState<string>("#000000");
  const [rotate, setRotate] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [mirror, setMirror] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  //We have an state for each attribute that we have in the adjustment form.

  const [image, setImage] = useState<HTMLImageElement>();
  //We are storing the image and will change it on each URL change

  //Following functions are simply adjusting the state on each input change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageURL(event.target.value);
  };

  const handleTextTopChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextTop(event.target.value);
  };

  const handleTextBottomChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTextBottom(event.target.value);
  };

  const handleTextColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTextColor(event.target.value);
  };

  const handleRotateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRotate(Number(event.target.value));
  };

  const handleScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScale(Number(event.target.value));
  };

  const handleMirrorChange = () => {
    setMirror(!mirror);
  };

  //This function is responsible for downloading the generated Meme
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement("a");
      link.href = url;
      link.download = "meme.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const draw = useCallback(() => {
    if (!image) return;
    //We're drawing the image on the canvas using the canvas context and will make our desired changes on top of it.
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        //We're adjusting the width of canvas based on the device's width and the image's original width
        const width =
          window.innerWidth > MAX_WIDTH
            ? MAX_WIDTH
            : (window.innerWidth * 80) / 100;
        canvas.width = width;
        const height = (width * image.height) / image.width; //This is for keeping the image's ratio;
        canvas.height = height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((rotate * Math.PI) / 180);
        //We're scaling the image based on the scale value and mirror values
        context.scale(scale, mirror ? -scale : scale);
        context.drawImage(
          image,
          -canvas.width / 2,
          -canvas.height / 2,
          canvas.width,
          canvas.height
        );
        context.textAlign = "center";
        context.fillStyle = textColor;
        const fontSize = `${36 / scale}px`;
        context.font = `bold ${fontSize} sans-serif`;
        const top = (40 - canvas.height / 2) / scale;
        const bottom = (canvas.height / 2 - 10) / scale;
        context.fillText(textTop.toUpperCase(), 0, top);
        context.fillText(textBottom.toUpperCase(), 0, bottom);
      }
    }
  }, [image, rotate, textBottom, textTop, textColor, scale, mirror]);

  useEffect(() => {
    if (imageURL.length > 5) {
      if (!urlRegx.test(imageURL) && !imageBase64Regx.test(imageURL)) {
        alert("URL is not correct");
        return;
      }
      const image = new Image();
      //This is for accessing images from other sites
      image.crossOrigin = "anonymous";
      image.src = imageURL;
      image.onload = () => {
        console.log("image loaded");
        setImage(image);
      };
      image.onerror = () => {
        alert("Error loading image");
        setImageURL("");
      };
    }
  }, [imageURL]);

  useEffect(() => {
    if (!image) return;
    if (testDrawFunction)
      testDrawFunction({
        image,
        rotate,
        textBottom,
        textTop,
        textColor,
        scale,
        mirror,
      });
    else draw();
  }, [image, rotate, textBottom, textTop, textColor, scale, mirror]);

  return (
    <div className="meme-generator">
      <span>Simply generate memes using any images from the web</span>
      <div className="form">
        <div className="input-container">
          <label htmlFor="image-url">Image URL:</label>
          <input
            type="text"
            id="image-url"
            data-testid="image-url"
            value={imageURL}
            placeholder="Paste an Image URL"
            onChange={handleImageChange}
          />
        </div>
        {imageURL && (
          <>
            <div className="input-container">
              <label htmlFor="text-top">Top Text:</label>
              <input
                type="text"
                id="text-top"
                data-testid="text-top"
                value={textTop}
                onChange={handleTextTopChange}
              />
            </div>
            <div className="input-container">
              <label htmlFor="text-bottom">Bottom Text:</label>
              <input
                type="text"
                id="text-bottom"
                data-testid="text-bottom"
                value={textBottom}
                onChange={handleTextBottomChange}
              />
            </div>
            <div className="input-container">
              <label htmlFor="text-color">Text Color:</label>
              <input
                type="color"
                id="text-color"
                data-testid="text-color"
                value={textColor}
                onChange={handleTextColorChange}
              />
            </div>
            <div className="input-container">
              <label htmlFor="rotate">Rotate:</label>
              <input
                type="range"
                id="rotate"
                data-testid="rotate"
                min="-180"
                max="180"
                value={rotate}
                onChange={handleRotateChange}
              />
            </div>
            <div className="input-container">
              <label htmlFor="scale">Scale:</label>
              <input
                type="range"
                id="scale"
                data-testid="scale"
                min="0.1"
                max="3"
                step="0.1"
                value={scale}
                onChange={handleScaleChange}
              />
            </div>
            <div className="input-container">
              <label htmlFor="mirror" id="mirror">
                Mirror:
              </label>
              <input
                type="checkbox"
                id="mirror"
                data-testid="mirror"
                checked={mirror}
                onChange={handleMirrorChange}
              />
            </div>
          </>
        )}
      </div>
      {imageURL && (
        <>
          <div className="meme-container">
            <canvas data-testid="canvas" ref={canvasRef}></canvas>
          </div>
          <button onClick={handleDownload}>Download</button>
        </>
      )}
    </div>
  );
};

export default MemeGenerator;
