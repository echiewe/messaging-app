
type Props = {
    conversationTitle: string;
    lastMessage: string;
    status: 'read' | 'unread';
};

export default function ConversationPreview({ conversationTitle, lastMessage, status }: Props) {
    return (
        <div className="w-full h-max border-b border-dark-green px-3 py-2">
            <div className="flex justify-between">
                <div className="flex flex-col">
                    <h2 className="text-2xl">{ conversationTitle }</h2>
                    <p className="text-black/60">{ lastMessage }</p>
                </div>
                <div>{ status }</div>
            </div>
        </div>
    );
}