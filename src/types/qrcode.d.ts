declare module "qrcode" {
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: {
      margin?: number;
      width?: number;
      color?: { dark?: string; light?: string };
    },
  ): Promise<void>;
}
