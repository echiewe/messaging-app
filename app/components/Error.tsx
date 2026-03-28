type Props = {
    message: string
}

export default function ErrorPage({message}: Props) {
    return (
        <div className="w-full h-full">
            <p className="text-red-500">message</p>
        </div>
    );
}