"use client"
import { useState } from "react"
import { SmilePlus } from "lucide-react"
import ReactionPicker from "./ReactionPicker"
import { addReaction } from "@/app/services/reactions"
import { Message } from "@/lib/types"

type Props = {
    m: Message
    currentUserId: string
    parseDate: (date: Date) => string
}

export function MessageBubble({ m, currentUserId, parseDate }: Props) {
    const [showPicker, setShowPicker] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const isMine = m.sender_id === currentUserId

    const groupedReactions = m.message_reactions.reduce((acc, r) => {
        if (!acc[r.reaction]) acc[r.reaction] = { count: 0, userReacted: false }
        acc[r.reaction].count++
        if (r.user_id === currentUserId) acc[r.reaction].userReacted = true
        return acc
    }, {} as Record<string, { count: number, userReacted: boolean }>)

    async function handleReaction(emoji: string) {
        await addReaction(m.id, emoji)
    }

    return (
        <div
        className={`w-full flex ${isMine ? 'justify-end' : 'justify-start'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
            setIsHovered(false)
            setShowPicker(false)
        }}
        >
            <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>

                {/* bubble + reaction button row */}
                <div className={`flex items-center gap-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

                    {/* message bubble */}
                    {m.type === 'image' ? (
                        <img
                        src={m.content}
                        alt="sent image"
                        className={`max-w-3xs m-2 cursor-pointer p-3 border
                            ${isMine ? 'bg-light-green border-dark-green' : 'bg-gray-200 border-gray-600'}`}
                        onClick={() => window.open(m.content, '_blank')}
                        onError={(e) => { e.currentTarget.src = '/icons/broken-image.png' }}
                        />
                    ) : (
                        <p className={`max-w-3xs text-sm p-2 mx-2 border
                        ${isMine ? 'bg-light-green border-dark-green text-dark-dark-green' : 'bg-gray-200 border-gray-600'}`}>
                        {m.content}
                        </p>
                    )}

                    {/* reaction button — only visible on hover */}
                    <div className="relative">
                        {isHovered && (
                        <button
                            onClick={() => setShowPicker((prev) => !prev)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            aria-label="Add reaction"
                        >
                            <SmilePlus size={16} />
                        </button>
                        )}

                        {/* reaction picker */}
                        {showPicker && (
                        <ReactionPicker
                            onSelect={handleReaction}
                            onClose={() => setShowPicker(false)}
                        />
                        )}
                    </div>
                </div>

                {/* grouped reaction counts */}
                {Object.keys(groupedReactions).length > 0 && (
                    <div className="flex gap-1 mx-2 mb-1 mt-1 flex-wrap">
                        {Object.entries(groupedReactions).map(([emoji, { count, userReacted }]) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className={`text-xs px-2 py-0.5 border flex items-center gap-1
                            ${userReacted
                                ? 'bg-light-green border-dark-green'
                                : 'bg-gray-100 border-gray-200'
                            }`}
                        >
                            {emoji} {count}
                        </button>
                        ))}
                    </div>
                )}

                <p className='text-gray-300 text-xs mx-2'>
                    {parseDate(new Date(m.created_at))}
                </p>
            </div>
        </div>
    )
}