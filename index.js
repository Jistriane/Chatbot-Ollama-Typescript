"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_service_1 = require("../../../lib/chat-service");
const router = (0, express_1.Router)();
const chatService = new chat_service_1.ChatService();
router.post('/', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }
    chatService.sendMessage(message)
        .then(response => res.json({ response }))
        .catch(error => {
        console.error('Erro ao processar chat:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    });
});
exports.default = router;
