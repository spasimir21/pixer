import { SubscribableNode } from '../nodes/base/SubscribableNode';
import { ReactiveEvent } from '../reactiveEvent';
import { addDependency } from '../dependencies';
import { makeReactive } from '../makeReactive';
import { TrackStack } from '../TrackStack';
import { EqualityCheck } from '../equal';
import { getRaw, setRaw } from '../raw';

const NUMBER_REGEXP = /^\d+$/;

interface ArrayAndNodes {
  array: any[];
  nodes: {
    index: Record<string, SubscribableNode>;
    $length: SubscribableNode;
  };
}

function makeArrayReactive<T extends any[]>(array: T, depth: number, equalityCheck: EqualityCheck): T {
  const nodes = {
    index: {} as Record<string, SubscribableNode>,
    $length: new SubscribableNode()
  };

  const _functionThis: ArrayAndNodes = { array, nodes };
  const functions = {
    push: function (this: ArrayAndNodes, ...items: any[]) {
      if (items.length !== 0) this.nodes.$length.broadcastEvent(ReactiveEvent.Changed);
      return this.array.push.call(proxy, ...items.map(item => makeReactive(item, depth, equalityCheck)));
    }.bind(_functionThis),
    pop: function (this: ArrayAndNodes) {
      if (this.array.length !== 0) this.nodes.$length.broadcastEvent(ReactiveEvent.Changed);
      return this.array.pop.call(proxy);
    }.bind(_functionThis),
    unshift: function (this: ArrayAndNodes, ...items: any[]) {
      if (items.length !== 0) this.nodes.$length.broadcastEvent(ReactiveEvent.Changed);
      return this.array.unshift.call(proxy, ...items.map(item => makeReactive(item, depth, equalityCheck)));
    }.bind(_functionThis),
    shift: function (this: ArrayAndNodes) {
      if (this.array.length !== 0) this.nodes.$length.broadcastEvent(ReactiveEvent.Changed);
      return this.array.shift.call(proxy);
    }.bind(_functionThis),
    splice: function (this: ArrayAndNodes, start: number, deleteCount: number, ...items: any[]) {
      if (deleteCount != items.length) this.nodes.$length.broadcastEvent(ReactiveEvent.Changed);
      return this.array.splice.call(
        proxy,
        start,
        deleteCount,
        ...items.map(item => makeReactive(item, depth, equalityCheck))
      );
    }.bind(_functionThis)
  };

  addDependency(array, nodes.$length);

  const proxy = new Proxy(array, {
    get(target, prop, reciever) {
      if (prop in functions) return (functions as any)[prop];

      if (prop === 'length') {
        nodes.$length.track();
        return Reflect.get(target, prop);
      }

      const result = Reflect.get(target, prop, reciever);
      if (!TrackStack.isTracking || typeof prop !== 'string') return result;

      if (TrackStack.isTracking && typeof prop === 'string' && prop.match(NUMBER_REGEXP) != null) {
        if (nodes.index[prop] == null) {
          nodes.index[prop] = new SubscribableNode();
          addDependency(array, nodes.index[prop]);
        }
        nodes.index[prop].track();
      }

      return Reflect.get(target, prop);
    },
    set(target, prop, newValue) {
      const oldValue = Reflect.get(target, prop);

      const didSet = Reflect.set(target, prop, makeReactive(newValue, depth, equalityCheck));

      if (typeof prop !== 'string' || !didSet || equalityCheck(getRaw(oldValue), getRaw(newValue))) return didSet;

      if (nodes.index[prop] != null) nodes.index[prop].broadcastEvent(ReactiveEvent.Changed);

      return didSet;
    }
  });

  setRaw(proxy, array);

  for (let i = 0; i < array.length; i++) array[i] = makeReactive(array[i], depth, equalityCheck);

  return proxy;
}

export { makeArrayReactive };
