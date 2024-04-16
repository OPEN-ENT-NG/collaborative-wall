package net.atos.entng.collaborativewall.events;

public enum RealTimeStatus {
  /** Has been stopped or not started yet. */
  STOPPED,
  /** Currently trying to start. */
  STARTING,
  /** Can accept real time connections.*/
  STARTED,
  /** Working but cannot accept more connections. */
  LIMIT,
  /** Not working and won't accept new connections*/
  ERROR
}
