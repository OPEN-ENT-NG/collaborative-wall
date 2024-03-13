import { NoteProps } from "~/models/notes";
import { NewState } from "~/models/store";

export const updatePresentState = (
  state: NewState | null,
  action: NewState,
  item: NoteProps,
) => {
  if (!state) return;

  if (state.item._id === action.item._id) {
    return {
      ...state,
      item: {
        ...state.item,
        modified: {
          $date: item.modified?.$date as number,
        },
        _id: item._id,
      },
    };
  }
  return state;
};
