const EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '👎']

type Props = {
    onSelect: (emoji: string) => void
    onClose: () => void
}

export default function ReactionPicker({ onSelect, onClose }: Props) {
    return (
        <div>
            {/* backdrop to close on outside click */}
            <div className="fixed inset-0 z-10" onClick={onClose} />

            <div className="absolute z-20 bottom-full mb-1 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1 flex gap-1">
                {EMOJIS.map((emoji) => (
                <button
                    key={emoji}
                    className="text-xl hover:scale-125 transition-transform p-1"
                    onClick={() => {
                    onSelect(emoji)
                    onClose()
                    }}
                >
                    {emoji}
                </button>
                ))}
            </div>
        </div>
    );
}