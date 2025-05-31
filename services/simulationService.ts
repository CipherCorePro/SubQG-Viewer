
import type { SimulationParams, TickData, Node, RNG as RNGInterface } from '../types';
import { SeededRNG, QuantumRNG } from '../utils/rng';

const SIMULATION_INTERVAL_MS = 50; // Controls speed of live updates

export class SimulationEngine { // Added export
  private params: SimulationParams;
  private rng: RNGInterface;
  private energyWaveValue: number = 0;
  private phaseWaveValue: number = 0;
  private currentTick: number = 0;
  private onTickUpdate: (tickData: TickData, rngState: any) => boolean; // Return false to stop
  private onComplete: () => void;
  private intervalId: number | null = null;
  private isEngineRunning: boolean = false; // Renamed to avoid confusion with App's isRunning

  constructor(
    params: SimulationParams,
    onTickUpdate: (tickData: TickData, rngState: any) => boolean,
    onComplete: () => void,
    initialRngState?: any
  ) {
    this.params = params;
    this.onTickUpdate = onTickUpdate;
    this.onComplete = onComplete;

    if (params.rngType === 'pseudo') {
      const seededRng = new SeededRNG(params.seed);
      // initialRngState is used if provided, otherwise the seed from params is used by SeededRNG constructor
      if (initialRngState !== null && initialRngState !== undefined) {
        seededRng.setState(initialRngState as number);
      }
      this.rng = seededRng;
    } else {
      this.rng = new QuantumRNG();
      // QuantumRNG is stateless for this example, so initialRngState is ignored
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
      return { tick, interferenceValue: interference };
    }
    return null;
  }

  private simulationStep(): void {
    if (!this.isEngineRunning) { // Check internal running state
        // If stop() was called, this.isEngineRunning will be false, and the interval should have been cleared.
        // This check is a safeguard.
        if (this.intervalId !== null) clearInterval(this.intervalId);
        this.intervalId = null;
        return;
    }
    if (this.currentTick >= this.params.duration) {
      this.stop(); // Stop internally
      this.onComplete();
      return;
    }

    const rngInput1 = this.rng.next();
    const rngInput2 = this.rng.next();

    this.energyWaveValue = this.calculateEnergyWave(this.energyWaveValue, rngInput1, this.params.noiseLevel);
    this.phaseWaveValue = this.calculatePhaseWave(this.phaseWaveValue, rngInput2, this.params.noiseLevel);
    const interference = this.calculateInterference(this.energyWaveValue, this.phaseWaveValue);
    const node = this.checkNodeFormation(this.currentTick, interference, this.params.threshold);

    const currentRngState = (this.rng as SeededRNG).getState ? (this.rng as SeededRNG).getState() : null;

    // onTickUpdate now always returns true from App.tsx to keep engine's interval alive.
    // Stopping is handled by calling engine.stop() or duration completion.
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
    if (this.isEngineRunning) return; // Already running
    this.isEngineRunning = true;
    // Clear any existing interval before starting a new one (robustness)
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
