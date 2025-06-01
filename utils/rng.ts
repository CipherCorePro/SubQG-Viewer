
import type { RNG } from '../types';

// Simple LCG parameters (glibc)
const LCG_A = 1103515245;
const LCG_C = 12345;
const LCG_M = Math.pow(2, 31);

export class SubQGRNG implements RNG { // Renamed from SeededRNG
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed === undefined || seed === null ? Math.floor(Math.random() * LCG_M) : seed;
    // Ensure seed is an integer
    this.seed = Math.floor(this.seed);
    if (this.seed < 0) {
        this.seed = (this.seed % LCG_M) + LCG_M;
    } else {
        this.seed = this.seed % LCG_M;
    }
  }

  public next(): number {
    this.seed = (LCG_A * this.seed + LCG_C) % LCG_M;
    return this.seed / LCG_M;
  }

  public getState(): number {
    return this.seed;
  }

  public setState(seed: number): void {
    this.seed = Math.floor(seed);
     if (this.seed < 0) {
        this.seed = (this.seed % LCG_M) + LCG_M; // Corrected LCG_M
    } else {
        this.seed = this.seed % LCG_M;
    }
  }
}

export class QuantumRNG implements RNG {
  // For frontend simulation, this will use Math.random()
  // In a real scenario, this might call an API.
  constructor() {}

  public next(): number {
    return Math.random();
  }
  
  // QuantumRNG is stateless for this implementation
  public getState(): null { return null; }
  public setState(): void {}
}