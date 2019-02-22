package com.example.socketserver.util;

import com.example.socketserver.CentralController;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class MessageHandler extends TextWebSocketHandler {
    CentralController commManager;
    public MessageHandler() {
        super();
        commManager = CentralController.getInstance();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        super.afterConnectionClosed(session, status);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        if (message.getPayload().equals("Begin Data Stream")) {
            if (!commManager.containsSession(session)) commManager.addSession(session);
            return;
        }
        commManager.handleIncomingMessage(message.getPayload());
    }
}
