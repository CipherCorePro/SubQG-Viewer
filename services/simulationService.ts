
import type { SimulationParams, TickData, Node, RNG as RNGInterface } from '../types';
import { SubQGRNG, QuantumRNG } from '../utils/rng'; // Updated to SubQGRNG

const SIMULATION_INTERVAL_MS = 50; // Controls speed of live updates

export class SimulationEngine {
  private params: SimulationParams;
  public rng: RNGInterface; // Made public for App.tsx to access getState
  private energyWaveValue: number = 0;
  private phaseWaveValue: number = 0;
  private currentTick: number = 0;
  private onTickUpdate: (tickData: TickData, rngState: any) => boolean; // Return false to stop
  private onComplete: () => void;
  private intervalId: number | null = null;
  private isEngineRunning: boolean = false;

  constructor(
    params: SimulationParams,
    onTickUpdate: (tickData: TickData, rngState: any) => boolean,
    onComplete: () => void,
    initialRngState?: any
  ) {
    this.params = params;
    this.onTickUpdate = onTickUpdate;
    this.onComplete = onComplete;

    if (params.rngType === 'subqg') { // Changed from 'pseudo'
      const subqgRng = new SubQGRNG(params.seed); // Changed from SeededRNG
      if (initialRngState !== null && initialRngState !== undefined && subqgRng.setState) {
        subqgRng.setState(initialRngState as number);
      }
      this.rng = subqgRng;
    } else {
      this.rng = new QuantumRNG();
    }
  }

  private calculateEnergyWave(currentValue: number, rngInput: number, noiseLevel: number): number {
    let newValue = currentValue + (rngInput - 0.5) * noiseLevel * 0.5; 
    return Math.max(-1, Math.min(1, newValue)); 
  }

  private calculatePhaseWave(currentValue: number, rngInput: number, noiseLevel: number): number {
    let phase_accumulator = Math.asin(currentValue) / Math.PI; 
    phase_accumulator += (rngInput - 0.5) * noiseLevel * 0.2; 
    return Math.sin(phase_accumulator * Math.PI);
  }

  private calculateInterference(energy: number, phase: number): number {
    return (energy + phase) / 2;
  }

  private checkNodeFormation(tick: number, interference: number, threshold: number): Node | null {
    if (interference > threshold) {
      const spin = Math.random() > 0.5 ? 1 : -1;
      const topologyType = 
          interference > (threshold + (1 - threshold) * 0.66) ? 'HighInterference' 
        : interference > (threshold + (1 - threshold) * 0.33) ? 'MidInterference' 
        : 'LowInterference';
      return { 
        tick, 
        interferenceValue: interference,
        spin,
        topologyType 
      };
    }
    return null;
  }

  private simulationStep(): void {
    if (!this.isEngineRunning) {
        if (this.intervalId !== null) clearInterval(this.intervalId);
        this.intervalId = null;
        return;
    }
    if (this.currentTick >= this.params.duration) {
      this.stop();
      this.onComplete();
      return;
    }

    const rngInput1 = this.rng.next();
    const rngInput2 = this.rng.next();

    this.energyWaveValue = this.calculateEnergyWave(this.energyWaveValue, rngInput1, this.params.noiseLevel);
    this.phaseWaveValue = this.calculatePhaseWave(this.phaseWaveValue, rngInput2, this.params.noiseLevel);
    const interference = this.calculateInterference(this.energyWaveValue, this.phaseWaveValue);
    const node = this.checkNodeFormation(this.currentTick, interference, this.params.threshold);

    const currentRngState = (this.rng as SubQGRNG).getState ? (this.rng as SubQGRNG).getState() : null;

    this.onTickUpdate(
      {
        tick: this.currentTick,
        energyWave: this.energyWaveValue,
        phaseWave: this.phaseWaveValue,
        interference: interference,
        node: node,
      },
      currentRngState
    );
    
    this.currentTick++;
  }

  public start(): void {
    if (this.isEngineRunning) return;
    this.isEngineRunning = true;
    if (this.intervalId !== null) {
        clearInterval(this.intervalId);
    }
    this.intervalId = window.setInterval(() => this.simulationStep(), SIMULATION_INTERVAL_MS);
  }

  public stop(): void {
    this.isEngineRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const runSimulation = (
  params: SimulationParams,
  onTickUpdate: (tickData: TickData, rngState: any) => boolean, 
  onComplete: () => void, 
  initialRngState?: any 
): SimulationEngine => {
  const engine = new SimulationEngine(params, onTickUpdate, onComplete, initialRngState);
  engine.start();
  return engine; 
};