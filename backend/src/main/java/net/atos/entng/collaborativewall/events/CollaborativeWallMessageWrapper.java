package net.atos.entng.collaborativewall.events;

import org.apache.commons.collections4.CollectionUtils;

import java.util.List;

public class CollaborativeWallMessageWrapper {
    private final List<CollaborativeWallMessage> messages;
    private final boolean allowInternal;
    private final boolean allowExternal;
    private final String exceptWSId;

    public CollaborativeWallMessageWrapper(List<CollaborativeWallMessage> messages, boolean allowInternal, boolean allowExternal) {
        this(messages, allowInternal, allowExternal, null);
    }

    public CollaborativeWallMessageWrapper(List<CollaborativeWallMessage> messages, boolean allowInternal, boolean allowExternal, String exceptWSId) {
        this.messages = messages;
        this.allowInternal = allowInternal;
        this.allowExternal = allowExternal;
        this.exceptWSId = exceptWSId;
    }

    public String getExceptWSId() {
        return exceptWSId;
    }

    public boolean isAllowExternal() {
        return allowExternal;
    }

    public List<CollaborativeWallMessage> getMessages() {
        return messages;
    }

    public boolean isAllowInternal() {
        return allowInternal;
    }

    public boolean isNotEmpty(){
        return CollectionUtils.isNotEmpty(this.getMessages());
    }
}
