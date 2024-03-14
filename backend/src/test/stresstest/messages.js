function createNotePayload(user, wallId, noteId) {
  return {
    _id: noteId,
    content: "<p>Coucou ca gaze ?</p>",
    owner: {
      userId: user.id,
      displayName: user.displayName,
    },
    x: 1037,
    y: 33,
    color: ["#F5F6CE", "#F2F5A9"],
    lastEdit: new Date().toISOString(),
    media: "https://example.com/image",
    idwall: wallId,
  };
}

function createWallPayload(user, wallId) {
  return {
    _id: wallId,
    name: "Stress Test - Mur Collab - " + Date.now(),
    description: "Description du mur collab",
    background: "/collaborativewall/public/img/default.jpg",
    icon: "",
  };
}

let randomWallCounter = 0;
export function createRandomWallMessage(user, wallId) {
  let modulo = randomWallCounter % 4;
  randomWallCounter++;
  switch (modulo) {
    case 0:
      return createPingMessage(user, wallId);
    case 1:
      return createWallUpdateMessage(user, wallId);
    case 2:
      return createNodeAddedMessage(user, wallId);
    case 3:
    default:
      return createMetadataMessage(user, wallId);
  }
}

let randomNoteCounter = 0;
export function createRandomNoteMessage(user, wallId, noteId) {
  let modulo = randomNoteCounter % 9;
  randomNoteCounter++;
  switch (modulo) {
    case 0:
      return createCursorMoveMessage(user, wallId, noteId);
    case 1:
      return createNodeEditionStartedMessage(user, wallId, noteId);
    case 2:
      return createTextUpdatedMessage(user, wallId, noteId);
    case 3:
      return createEditionEndedMessage(user, wallId, noteId);
    case 4:
      return createImageUpdatedMessage(user, wallId, noteId);
    case 5:
      return createNoteMovedMessage(user, wallId, noteId);
    case 6:
      return createNoteDeletedMessage(user, wallId, noteId);
    case 7:
      return createNoteSelectedMessage(user, wallId, noteId);
    case 8:
    default:
      return createNoteUnSelectedMessage(user, wallId, noteId);
  }
}

export function createPingMessage(user, wallId) {
  return ({
    wallId,
    type: "ping",
  });
}

export function createMetadataMessage(user, wallId) {
  return ({
    wallId,
    type: "metadata",
  });
}
export function createWallUpdateMessage(user, wallId) {
  return ({
    wallId,
    type: "wallUpdate",
    wall: createWallPayload(user, wallId),
  });
}
export function createWallDeleteMessage(user, wallId) {
  return ({
    wallId,
    type: "wallDeleted",
  });
}
export function createNodeAddedMessage(user, wallId) {
  return ({
    wallId,
    type: "ping",
  });
}
export function createCursorMoveMessage(user, wallId, noteId) {
  return ({
    wallId,
    noteId,
    move: [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
    type: "cursorMove",
  });
}
export function createNodeEditionStartedMessage(user, wallId, noteId) {
  return ({
    wallId,
    type: "noteEditionStarted",
    noteId,
  });
}
export function createTextUpdatedMessage(user, wallId, noteId) {
  return ({
    wallId,
    type: "noteTextUpdated",
    note: createNotePayload(user, wallId, noteId),
  });
}
export function createEditionEndedMessage(user, wallId, noteId) {
  return ({
    wallId,
    type: "noteEditionEnded",
    noteId,
  });
}
export function createImageUpdatedMessage(user, wallId, noteId) {
  return ({
    wallId,
    type: "noteImageUpdated",
    note: createNotePayload(user, wallId, noteId),
  });
}
export function createNoteMovedMessage(user, wallId, noteId) {
  return ({
    wallId,
    type: "noteMoved",
    note: createNotePayload(user, wallId, noteId),
  });
}
export function createNoteDeletedMessage(user, wallId, noteId) {
  return ({
    wallId,
    type: "noteDeleted",
    noteId,
  });
}
export function createNoteSelectedMessage(user, wallId, noteId) {
  return ({
    wallId,
    type: "noteSelected",
    noteId,
  });
}
export function createNoteUnSelectedMessage(user, wallId, noteId) {
  return ({
    wallId,
    type: "noteUnselected",
    noteId,
  });
}
