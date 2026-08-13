// Local type definitions
enum FramingMode {
  AUTO = "AUTO",
  CENTER = "CENTER",
  FACE = "FACE",
  MOTION = "MOTION",
  FACE_TRACKING = "FACE_TRACKING",
  CENTER_CROP = "CENTER_CROP"
}

interface FramingData {
  mode: string;
  centerX: number;
  centerY: number;
  scale: number;
  width: number;
  height: number;
  trackingEnabled: boolean;
  targetWidth?: number;
  targetHeight?: number;
  offsetX?: number;
  offsetY?: number;
  clampedX?: number;
}

export class SmartFramingEngine {
  /**
   * Função matemática clamp para garantir que o corte não extrapole as bordas do vídeo original
   * Formula: x = clamp(xCenter - cropWidth / 2, 0, originalWidth - cropWidth)
   */
  public clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }

  public calculateFraming(
    originalWidth: number,
    originalHeight: number,
    targetCropWidth = 1080,
    targetCropHeight = 1920,
    detectedFaceXCenter?: number
  ): FramingData {
    // Supondo vídeo horizontal 16:9 (ex: 1920x1080)
    // O crop vertical 9:16 necessita de uma largura equivalente no vídeo horizontal:
    // cropWidthNoScale = originalHeight * (9 / 16)
    const cropWidthInOriginal = Math.round(originalHeight * (9 / 16));

    let mode: FramingMode;
    let rawXCenter: number;
    let hasFaceDetected = false;

    if (detectedFaceXCenter !== undefined && detectedFaceXCenter >= 0 && detectedFaceXCenter <= originalWidth) {
      mode = FramingMode.FACE_TRACKING;
      rawXCenter = detectedFaceXCenter;
      hasFaceDetected = true;
    } else {
      // Fallback Hierarchy: Subject -> Visual Focus -> Center Crop
      mode = FramingMode.CENTER_CROP;
      rawXCenter = originalWidth / 2;
    }

    // Aplicação estrita da fórmula de clamping
    const halfCrop = cropWidthInOriginal / 2;
    const clampedX = this.clamp(rawXCenter - halfCrop, 0, originalWidth - cropWidthInOriginal);

    return {
      mode: String(mode),
      centerX: rawXCenter,
      centerY: originalHeight / 2,
      scale: 1.0,
      width: targetCropWidth,
      height: targetCropHeight,
      trackingEnabled: hasFaceDetected,
      targetWidth: targetCropWidth,
      targetHeight: targetCropHeight,
      offsetX: Math.round(clampedX),
      offsetY: 0
    };
  }

  public getFFmpegCropFilter(framing: FramingData, originalWidth: number, originalHeight: number): string {
    const cropWidthInOriginal = Math.round(originalHeight * (9 / 16));
    const cropX = framing.offsetX || 0;
    
    // FFmpeg crop filter: crop=out_w:out_h:x:y,scale=1080:1920
    return `crop=${cropWidthInOriginal}:${originalHeight}:${cropX}:0,scale=1080:1920`;
  }
}

export const smartFramingEngine = new SmartFramingEngine();
