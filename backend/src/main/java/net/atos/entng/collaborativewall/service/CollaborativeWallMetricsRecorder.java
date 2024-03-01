package net.atos.entng.collaborativewall.service;

public interface CollaborativeWallMetricsRecorder {
  /**
   *
   * @param lifespan Time in milliseconds elapsed between the creation of the message and whn it has been sent to the
   *                 user
   */
  void onLocalBroadcast(long lifespan);

  /**
   *
   * @param lifespan Time in milliseconds elapsed between the creation of the message and whn it has been sent to the
   *                 user
   */
  void onExternalBroadcast(long lifespan);

  /**
   * When an error occurred while sending a message to the user.
   */
  void onSendError();

  void onConnectionRejected();

  void onStart();

  void onError();

  class NoopRecorder implements CollaborativeWallMetricsRecorder {

    public static final NoopRecorder instance = new NoopRecorder();
    @Override
    public void onLocalBroadcast(long lifespan) {

    }

    @Override
    public void onExternalBroadcast(long lifespan) {

    }

    @Override
    public void onSendError() {

    }

    @Override
    public void onConnectionRejected() {

    }

    @Override
    public void onStart() {

    }

    @Override
    public void onError() {

    }
  }
}
