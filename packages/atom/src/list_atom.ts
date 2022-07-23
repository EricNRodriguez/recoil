import {LeafAtom} from "./atom.interface";
import {t} from "../../dom-dsl";

export class ListTrackingProxyHandler<T> implements ProxyHandler<T[]> {
  public get(target: T[], p: string): any {
    console.log(`get called!`);
    return target[p];
  }

  public set(target: T[], p: string | symbol, value: any, receiver: any): boolean {
    console.log("set called");
    target[p] = value;
    return true;
  }
}

export const hackCreateObservableList = <T>(list: T[]): T[] => {
    const trackingHandler: ListTrackingProxyHandler<T> = new ListTrackingProxyHandler();
    return new Proxy(list, trackingHandler);
};

// class ListOperationTracker {
//
// }
//
// const listTrackingProxy = {
//   get(target: Object, property: string) {
//
//     return property === 'fullName' ?
//       `${target.firstName} ${target.lastName}` :
//       target[property];
//   },
//   set(target: Object, property: string, value: any) {
//     if (property === 'age') {
//       if (typeof value !== 'number') {
//         throw new Error('Age must be a number.');
//       }
//       if (value < 18) {
//         throw new Error('The user must be 18 or older.')
//       }
//     }
//     target[property] = value;
//   }
// }