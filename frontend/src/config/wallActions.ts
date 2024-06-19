import { ACTION, IAction } from "edifice-ts-client";
import { workflows } from "./workflows";

export const wallActions: IAction[] = [
  {
    id: ACTION.OPEN,
    workflow: workflows.view,
    right: "read",
  },
  {
    id: ACTION.EDIT,
    workflow: workflows.view,
    right: "manager",
  },
  {
    id: ACTION.CREATE,
    workflow: workflows.create,
    right: "manager",
  },
  {
    id: ACTION.PUBLISH,
    workflow: workflows.create,
    right: "manager",
  },
  {
    id: ACTION.SHARE,
    workflow: workflows.view,
    right: "creator",
  },
  {
    id: ACTION.PRINT,
    workflow: workflows.create,
    right: "read",
  },
];
