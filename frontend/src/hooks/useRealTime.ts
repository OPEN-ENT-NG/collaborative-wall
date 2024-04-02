/* let nextId = 0;
let todos = [{ id: nextId++, text: "Todo #1" }];
let listeners = []; */

import { RealTimeProxyService } from "~/services/realtime/RealTimeProxyService";

/* export const todosStore = {
  addTodo() {
    todos = [...todos, { id: nextId++, text: "Todo #" + nextId }];
    emitChange();
  },
  subscribe(listener) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return todos;
  },
};

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
} */

export const store = (resourceId: string, start = false) => {
  const service = new RealTimeProxyService(resourceId, start);

  function subscribe() {
    return service.subscribe;
  }

  function getSnapshot() {
    return service.ready;
  }

  return {
    subscribe,
    getSnapshot,
  };
};
