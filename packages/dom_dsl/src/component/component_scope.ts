import {SideEffectRef} from "../../../atom";

/**
 * An ad-hoc scoped collector, analogous to a symbol table
 */
export class ComponentScope {
  private static readonly instance = new ComponentScope();
  private readonly effects: Map<number, SideEffectRef[]> = new Map();

  private currentScope: number = -1;

  public static getInstance(): ComponentScope {
    return ComponentScope.instance;
  }

  public isInScope(): boolean {
    return this.currentScope >= 0;
  }

  public enterScope(): void {
    this.currentScope++;
    this.effects.set(this.currentScope, []);
  }

  public exitScope(): void {
    this.effects.delete(this.currentScope);
    this.currentScope--;
  }

  public collectEffect(effect: SideEffectRef): void {
    this.effects.get(this.currentScope)?.push(effect);
  }

  public getEffects(): SideEffectRef[] {
    return this.effects.get(this.currentScope) ?? [];
  }
}
