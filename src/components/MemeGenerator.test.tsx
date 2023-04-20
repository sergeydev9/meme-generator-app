/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import MemeGenerator from "./MemeGenerator";
import "@testing-library/jest-dom/extend-expect";
import { act } from "react-dom/test-utils";

export type TestDrawProps = {
  image: HTMLImageElement;
  textTop: string;
  textBottom: string;
  textColor: string;
  rotate: number;
  scale: number;
  mirror: boolean;
};
const mockContext = {
  fillRect: jest.fn(),
  rotate: jest.fn((x) => {}),
  drawImage: jest.fn((i) => {}),
  scale: jest.fn((x, y) => {}),
  fillColor: jest.fn((x) => {}),
  fillText: jest.fn((x) => {}),
};

const mockDraw = jest.fn((props: TestDrawProps) => {
  const { image, textTop, textBottom, textColor, rotate, scale, mirror } =
    props;
  const context = mockContext;
  context.drawImage(image);
  if (rotate) context.rotate((rotate * Math.PI) / 180);
  if (scale != 1 || mirror) context.scale(scale, mirror ? -scale : scale);
  if (textTop) context.fillText(textTop.toUpperCase());
  if (textBottom) context.fillText(textBottom.toUpperCase());
  if (textColor) context.fillColor(textColor);
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe("MemeGenerator", () => {
  it("renders the input elements correctly", async () => {
    act(() => {
      render(<MemeGenerator testDrawFunction={mockDraw} />);
    });
    const input = screen.getByTestId("image-url") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    //Changin the image URL
    act(() => {
      fireEvent.change(input, {
        target: {
          value: "https://picsum.photos/536/354",
        },
      });
    });
    //Expecting all elements to render after the URL is changed
    await waitFor(() => {
      expect(screen.getByTestId("text-top")).toBeInTheDocument();
      expect(screen.getByTestId("text-bottom")).toBeInTheDocument();
      expect(screen.getByTestId("text-color")).toBeInTheDocument();
      expect(screen.getByTestId("rotate")).toBeInTheDocument();
      expect(screen.getByTestId("scale")).toBeInTheDocument();
      expect(screen.getByTestId("mirror")).toBeInTheDocument();
    });
    await act(() => delay(6000)); // waiting for image to load. Sometimes you might get failure at tests because the image might not load within the defined timeout. Please test again in that cases

    //Changin the value of top text and expecting the context to call fillText with the input value
    const topText = screen.getByTestId("text-top") as HTMLInputElement;
    act(() => {
      fireEvent.change(topText, { target: { value: "Hello" } });
    });
    await waitFor(() => {
      expect(mockContext.fillText).toHaveBeenCalledWith("HELLO");
    });

    //Changin the value of bottom text and expecting the context to call fillText with the input value
    const bottomText = screen.getByTestId("text-bottom") as HTMLInputElement;
    act(() => {
      fireEvent.change(bottomText, { target: { value: "World" } });
    });
    await waitFor(() => {
      expect(mockContext.fillText).toHaveBeenCalledWith("WORLD");
    });

    //Changin the value of color chooser and expecting the context to call fillColor with the input value
    const color = screen.getByTestId("text-color") as HTMLInputElement;
    act(() => {
      fireEvent.change(color, { target: { value: "#ff0000" } });
    });
    await waitFor(() => {
      expect(mockContext.fillColor).toHaveBeenCalledWith("#ff0000");
    });

    //Changin the rotate value and expecting the context to call rotate with new value
    const rotate = screen.getByTestId("rotate") as HTMLInputElement;
    act(() => fireEvent.change(rotate, { target: { value: "45" } }));
    await waitFor(() => {
      expect(mockContext.rotate).toHaveBeenCalledWith((45 * Math.PI) / 180);
    });

    //Changin the scale value and expecting the context to call scale with new value
    const scale = screen.getByTestId("scale") as HTMLInputElement;
    act(() => {
      fireEvent.change(scale, { target: { value: "2" } });
    });
    await waitFor(() => {
      expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
    });

    //Changin the mirror value and expecting the context to call scale new value
    const checkbox = screen.getByTestId("mirror") as HTMLInputElement;
    act(() => {
      fireEvent.click(checkbox);
    });
    await waitFor(() => {
      expect(checkbox.checked).toBe(true);
      expect(mockContext.scale).toHaveBeenCalledWith(2, -2);
    });
  }, 10000);
});
