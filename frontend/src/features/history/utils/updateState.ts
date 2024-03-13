import { updateActionState } from "./updateActionState";
import { updatePresentState } from "./updatePresentState";
import { NoteProps } from "~/models/notes";
import { NewState } from "~/models/store";
import { useHistoryStore } from "~/store";

export const updateState = (action: NewState, note: NoteProps) => {
  useHistoryStore.setState((state) => {
    return {
      ...state,
      past: updateActionState(state.past, action, note),
      present: updatePresentState(state.present, action, note),
      future: updateActionState(state.future, action, note),
    };
  });
};
