document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const themeToggle = document.getElementById('theme-toggle');
    const deleteChat = document.getElementById('delete-chat');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatHistory = document.getElementById('chat-history');
    
    // Estado da aplicação
    let currentChatId = generateChatId();
    let conversations = loadConversations();

    // Inicialização
    initializeTheme();
    renderChatHistory();
    
    // Ajusta automaticamente a altura do textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Toggle do tema claro/escuro
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Atualiza o ícone
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    });

    // Novo chat
    newChatBtn.addEventListener('click', () => {
        currentChatId = generateChatId();
        chatMessages.innerHTML = '';
        saveCurrentChat();
        renderChatHistory();
    });

    // Excluir chat atual
    deleteChat.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir esta conversa?')) {
            deleteCurrentChat();
            chatMessages.innerHTML = '';
            renderChatHistory();
        }
    });

    // Função para adicionar mensagem ao chat
    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user' : 'bot');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Salva a conversa atual
        saveCurrentChat();

        // Atualiza o histórico
        renderChatHistory();
    }

    // Manipula o envio do formulário
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message) return;

        // Adiciona a mensagem do usuário ao chat
        addMessage(message, true);

        // Limpa e reseta o input
        messageInput.value = '';
        messageInput.style.height = 'auto';

        try {
            // Faz a requisição para o servidor
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Erro na comunicação com o servidor');
            }

            const data = await response.json();
            
            // Adiciona a resposta do bot ao chat
            addMessage(data.response);
        } catch (error) {
            console.error('Erro:', error);
            addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', false);
        }
    });

    // Permite enviar com Enter (Shift + Enter para nova linha)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Funções auxiliares
    function generateChatId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Configura o ícone correto
        const icon = themeToggle.querySelector('i');
        icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    function loadConversations() {
        return JSON.parse(localStorage.getItem('chatConversations')) || {};
    }

    function saveConversations(conversations) {
        localStorage.setItem('chatConversations', JSON.stringify(conversations));
    }

    function saveCurrentChat() {
        const messages = Array.from(chatMessages.children).map(msg => {
            return {
                content: msg.textContent,
                isUser: msg.classList.contains('user')
            };
        });

        if (messages.length === 0) return;

        conversations[currentChatId] = {
            id: currentChatId,
            title: getConversationTitle(messages),
            messages: messages,
            timestamp: Date.now()
        };

        saveConversations(conversations);
    }

    function getConversationTitle(messages) {
        // Usa a primeira mensagem do usuário como título
        const firstUserMessage = messages.find(msg => msg.isUser);
        if (firstUserMessage) {
            // Limita o tamanho do título
            let title = firstUserMessage.content.trim();
            return title.length > 30 ? title.substring(0, 27) + '...' : title;
        }
        return 'Nova conversa';
    }

    function renderChatHistory() {
        chatHistory.innerHTML = '';
        
        // Ordena as conversas por timestamp (mais recente primeiro)
        const sortedConversations = Object.values(conversations)
            .sort((a, b) => b.timestamp - a.timestamp);

        sortedConversations.forEach(conv => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            if (conv.id === currentChatId) historyItem.classList.add('active');
            historyItem.textContent = conv.title;
            historyItem.dataset.chatId = conv.id;
            
            historyItem.addEventListener('click', () => {
                loadChat(conv.id);
            });
            
            chatHistory.appendChild(historyItem);
        });
    }

    function loadChat(chatId) {
        if (!conversations[chatId]) return;
        
        currentChatId = chatId;
        chatMessages.innerHTML = '';
        
        conversations[chatId].messages.forEach(msg => {
            addMessage(msg.content, msg.isUser);
        });
        
        renderChatHistory();
    }

    function deleteCurrentChat() {
        if (conversations[currentChatId]) {
            delete conversations[currentChatId];
            saveConversations(conversations);
            
            // Se não houver mais conversas, cria uma nova
            if (Object.keys(conversations).length === 0) {
                currentChatId = generateChatId();
            } else {
                // Carrega a conversa mais recente
                const mostRecentChatId = Object.values(conversations)
                    .sort((a, b) => b.timestamp - a.timestamp)[0].id;
                loadChat(mostRecentChatId);
            }
        }
    }
}); 