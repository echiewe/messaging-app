
type Props = {
    conversationTitle: string;
    lastMessage: string;
    status: 'read' | 'unread';
    lastSent: string;
};

export default function ConversationPreview({ conversationTitle, lastMessage, lastSent, status }: Props) {
    return (
        <div className={`w-full h-max border-b border-b-dark-green px-3 py-2 
            ${status==='read' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-off-white hover:bg-gray-100 border-l-5 border-l-blue'}
            `}>
            <div className="flex justify-between">
                <div className="flex flex-col">
                    <h2 className={`text-xl ${status==='unread' && 'text-dark-dark-green font-medium'}`}>{ conversationTitle }</h2>
                    <div className={`text-sm ${status==='unread' ? 'text-gray-800' : 'text-gray-500'}`}>{ lastMessage }</div>
                </div>
                {lastSent && <div className={`text-sm ${status==='unread' ? 'text-gray-400' : 'text-gray-500'}`}>{lastSent}</div>}
            </div>
        </div>
    );
}