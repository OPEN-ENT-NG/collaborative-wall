import { NoteProps } from "~/models/notes";
import { NewState } from "~/models/store";

export const updateActionState = (
  states: NewState[],
  action: NewState,
  item: NoteProps,
) => {
  return states.map((state) => {
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
  });
};
