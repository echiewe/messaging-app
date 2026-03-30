type Props = {
    message: string
    className?: string
    status?: string
    iconUrl?: string
}

export default function Alert({ message, className, status, iconUrl }: Props) {
    return (
        <div className={`${className} absolute top-10 w-max h-max flex justify-between gap-5 items-center p-3 
        ${status==='success' ? 'bg-light-green border border-dark-green text-dark-green' : 
        (status==='error' ? 'bg-red-100 border border-red-600 text-red-600' : 
            'bg-gray-200 border border-gray-500 text-gray-500')}`}>
            <img src='/icons/icon.png' alt='' width={25} />
            <p>{message}</p>
        </div>
    );
}