export type Message = {
    id: string
    content: string
    created_at: string
    sender_id: string
}

export type Conversation = {
    id: string
    created_at: string
    name: string
    lastMessage: string
    messages: Message[]
}

export type ConversationMember = {
    conversation_id: string
    conversation: Conversation
}

export type User = {
    id: string
    username: string
    display_name: string
    avatar: string
}