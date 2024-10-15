import { NoteProps } from '~/models/notes';
import { useHistoryStore } from '~/store';
import { NewState } from '~/store/history/types';
import { updateActionState } from './updateActionState';
import { updatePresentState } from './updatePresentState';

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
