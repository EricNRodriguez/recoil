import {state} from "../../../packages/atom";

export type TodoItem = {
  uuid: number,
  content: string,
};

export class TodoModel {

  @state()
  private items: TodoItem[] = [];

  @state()
  private nextId = 0;

  public appendNewItem(content: string): TodoItem {
    const id = this.nextId++;
    const newItem = {
      uuid: id,
      content: content,
    };

    this.items = [
      ...this.items,
      newItem,
    ];

    return newItem;
  }

  public removeItem(item: TodoItem): void {
    this.items = this.items.filter(existingItem => existingItem.uuid !== item.uuid);
  }

  public getItems(): TodoItem[] {
    return this.items;
  }
}