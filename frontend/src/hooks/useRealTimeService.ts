import { useEffect, useState } from "react";

import { NoteProps, PickedNoteProps } from "~/models/notes";
import {
  useCreateNote,
  useDeleteNote,
  useInvalidateNotesFactory,
  useUpdateNote,
} from "~/services/queries";
import { RealTimeProxyService } from "~/services/realtime/index";
import { EventPayload } from "~/services/realtime/types";

const instances = new Map<string, RealTimeProxyService>();

export function useRealTimeService(resourceId: string) {
  if (!resourceId) {
    throw "[useRealTimeService] missing ressourceId:" + resourceId;
  }
  // create instance
  const instance =
    instances.get(resourceId) ?? new RealTimeProxyService(resourceId, true);
  instances.set(resourceId, instance);
  // load dependencies
  const _createNote = useCreateNote();
  const _updateNote = useUpdateNote();
  const _deleteNote = useDeleteNote();
  // events
  const createNote = async (note: PickedNoteProps) => {
    const response = await _createNote.mutateAsync(note);
    const { status, wall } = response;
    if (status === "ok") {
      const size = wall.length;
      const note = wall[size - 1];
      await instance.sendNoteAddedEvent({ ...note, _id: note._id });
    }
    return response;
  };
  const updateNote = async (
    args: { id: string; note: PickedNoteProps },
    options: { onSuccess: (responseData: any) => Promise<void> },
  ) => {
    const response = await _updateNote.mutateAsync(args, options);
    if (response.status === "ok") {
      await Promise.all([
        instance.sendNoteTextUpdatedEvent({ ...args.note, _id: args.id }),
        instance.sendNoteImageUpdatedEvent({ ...args.note, _id: args.id }),
      ]);
    }
    return response;
  };
  const deleteNote = async (note: NoteProps) => {
    const response = await _deleteNote.mutateAsync(note);
    const { status } = response;
    if (status === "ok") {
      await instance.sendNoteDeletedEvent(note._id);
    }
    return response;
  };
  // listen
  const [lastEvent, setLastEvent] = useState<EventPayload | undefined>();
  const [filterEvent, setFilterEvent] = useState<EventPayload["type"][]>([]);
  const listen = (...keys: EventPayload["type"][]) => {
    if (!keys.every((key) => filterEvent.includes(key))) {
      setFilterEvent((old) => [...old, ...keys]);
    }
  };
  const invalidateNote = useInvalidateNotesFactory();
  useEffect(() => {
    const unsubscribe = instance.subscribe((event) => {
      if (filterEvent.includes(event.type)) {
        setLastEvent(event);
      }
      switch (event.type) {
        case "metadata":
        case "ping":
        case "wallUpdate":
        case "wallDeleted":
        case "cursorMove":
        case "noteEditionStarted":
        case "noteEditionEnded":
        case "noteMoved": {
          break;
        }
        case "noteTextUpdated":
        case "noteImageUpdated":
        case "noteAdded":
        case "noteDeleted": {
          invalidateNote();
          break;
        }
        case "noteSelected":
        case "noteUnselected":
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);
  // stop
  const stop = () => {
    return instance.stop();
  };
  return {
    createNote,
    updateNote,
    deleteNote,
    stop,
    listen,
    lastEvent,
  };
}
