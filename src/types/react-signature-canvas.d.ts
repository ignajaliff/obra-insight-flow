
declare module 'react-signature-canvas' {
  import * as React from 'react';

  export interface SignatureCanvasProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
    minWidth?: number;
    maxWidth?: number;
    penColor?: string;
    backgroundColor?: string;
    throttle?: number;
    velocityFilterWeight?: number;
    onBegin?: () => void;
    onEnd?: () => void;
    dotSize?: number | (() => number);
  }

  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear: () => void;
    isEmpty: () => boolean;
    toDataURL: (type?: string, encoderOptions?: number) => string;
    fromDataURL: (dataURL: string, options?: { ratio?: number; width?: number; height?: number }) => void;
    toData: () => Array<Point>;
    fromData: (pointGroups: Array<Point>) => void;
    off: () => void;
    on: () => void;
  }

  export interface Point {
    x: number;
    y: number;
    time: number;
  }
}
