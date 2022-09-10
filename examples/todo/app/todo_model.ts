import { createState, runBatched, runUntracked, state } from "recoiljs-atom";

export type TodoItem = {
  uuid: number;
  content: string;
};

export class TodoModel {
  @state()
  private items: TodoItem[] = [];

  @state()
  private nextId = 0;

  constructor() {}

  public appendNewItem(content: string): TodoItem {
    const newItem = {
      uuid: this.nextId++,
      content: content,
    };

    this.items = [...this.items, newItem];

    return newItem;
  }

  public removeItem(item: TodoItem): void {
    this.items = this.items.filter(
      (existingItem) => existingItem.uuid !== item.uuid
    );
  }

  public clearItems(): void {
    this.items = [];
  }

  public duplicate(): void {
    runBatched(() => {
      this.items = [
        ...this.items,
        ...this.items.map((i) => {
          return {
            uuid: this.nextId++,
            content: i.content,
          };
        }),
      ];
    });
  }

  public getItems(): TodoItem[] {
    return this.items;
  }
}
