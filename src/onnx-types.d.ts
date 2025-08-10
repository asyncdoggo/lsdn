// Type declarations for onnxruntime-web
declare module 'onnxruntime-web/webgpu' {
  export namespace env {
    export namespace wasm {
      export let wasmPaths: string;
      export let numThreads: number;
    }
    export let logLevel: 'verbose' | 'info' | 'warning' | 'error' | 'fatal';
  }

  export interface TypedArray {
    readonly length: number;
    [index: number]: number;
  }

  export interface BigIntTypedArray {
    readonly length: number;
    [index: number]: bigint;
  }

  export class Tensor {
    constructor(type: 'float32', data: TypedArray, dims: readonly number[]);
    constructor(type: 'float16', data: Uint16Array, dims: readonly number[]); // Uint16Array for float16
    constructor(type: 'int32', data: TypedArray, dims: readonly number[]);
    constructor(type: 'int64', data: BigIntTypedArray, dims: readonly number[]);
    constructor(type: string, data: TypedArray | BigIntTypedArray | Uint16Array, dims: readonly number[]);
    readonly data: TypedArray | BigIntTypedArray | Uint16Array;
    readonly dims: readonly number[];
    readonly type: string;
    readonly size: number;
    
    // WebGPU specific methods (may not be available in all environments)
    dispose?(): void;
    toImageData?(options: { tensorLayout: string; format: string }): ImageData;
  }

  export interface InferenceSession {
    run(feeds: Record<string, Tensor>): Promise<Record<string, Tensor>>;
    release(): Promise<void>;
    readonly inputNames: readonly string[];
    readonly outputNames: readonly string[];
  }

  export namespace InferenceSession {
    interface SessionOptions {
      executionProviders?: string[];
      graphOptimizationLevel?: 'disabled' | 'basic' | 'extended' | 'all';
      logId?: string;
      logSeverityLevel?: number;
      logVerbosityLevel?: number;
      enableProfiling?: boolean;
      enableMemPattern?: boolean;
      enableCpuMemArena?: boolean;
      freeDimensionOverrides?: Record<string, number>;
      preferredOutputLocation?: Record<string, string>;
      extra?: {
        session?: Record<string, string>;
      };
    }

    export function create(
      pathOrBuffer: string | ArrayBuffer | Uint8Array,
      options?: SessionOptions
    ): Promise<InferenceSession>;
  }
}
