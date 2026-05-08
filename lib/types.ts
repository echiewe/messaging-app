export type Message = {
    id: string
    content: string
    created_at: string
    sender_id: string
    type: 'text' | 'image'
    message_reactions: Reaction[]
}

export type Conversation = {
    id: string
    created_at: string
    name: string
    lastMessage: string
    messages: Message[]
    lastSent: string
    isUnread: boolean
}

export type ConversationMember = {
    conversation_id: string
    conversation: Conversation
}

export type User = {
    id: string
    username: string
    display_name: string
    avatar_url: string
}

export type Reaction = {
  id: string
  reaction: string
  user_id: string
}