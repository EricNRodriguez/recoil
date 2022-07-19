import { Runnable } from "../../../util";

/**
 * An ad-hoc scoped collector, analogous to a symbol table
 */
export class ComponentScope {
  private static readonly instance = new ComponentScope();
  private readonly onMountEffects: Map<number, Runnable[]> = new Map();
  private readonly onUnmountEffects: Map<number, Runnable[]> = new Map();

  private currentScope: number = -1;

  public static getInstance(): ComponentScope {
    return ComponentScope.instance;
  }

  public isInScope(): boolean {
    return this.currentScope >= 0;
  }

  public enterScope(): void {
    this.currentScope++;

    this.onMountEffects.set(this.currentScope, []);
    this.onUnmountEffects.set(this.currentScope, []);
  }

  public exitScope(): void {
    this.onMountEffects.delete(this.currentScope);
    this.onUnmountEffects.delete(this.currentScope);

    this.currentScope--;
  }

  public collectOnMountEffect(effect: Runnable): void {
    this.onMountEffects.get(this.currentScope)?.push(effect);
  }

  public getOnMountEffects(): Runnable[] {
    return this.onMountEffects.get(this.currentScope) ?? [];
  }

  public collectOnUnmountEffect(effect: Runnable): void {
    this.onUnmountEffects.get(this.currentScope)?.push(effect);
  }

  public getOnUnmountEffects(): Runnable[] {
    return this.onUnmountEffects.get(this.currentScope) ?? [];
  }
}
