/* SAMPLE STORE */

/* export interface State {
  count: number;
  updaters: {
    setCount: () => void;
  };
} */
/* export const useStoreContext = create<State>()((set, get) => ({
  count: 0,
  updaters: {
    setCount: () => set((state) => ({ count: state.count + 1 })),
  },
})); */

/* Export a specific state with a custom hook */
// export const useCount = () => useStoreContext((state) => state.count);

/* Access your state  */
// const count = useCount();

/* Export updaters */
// export const useStoreUpdaters = () => useStoreContext((state) => state.updaters);

/* Access updaters with destructuring */
// const { setCount } = useStoreUpdaters();
