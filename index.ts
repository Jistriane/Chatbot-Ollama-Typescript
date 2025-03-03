import { Router, Request, Response } from 'express';
import { ChatService } from '../../../lib/chat-service';

const router = Router();
const chatService = new ChatService();

interface ChatRequest {
    message: string;
}

router.post('/', (req: Request<{}, any, ChatRequest>, res: Response) => {
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

export default router; 