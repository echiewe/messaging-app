type Props = {
    children: React.ReactNode
}

export default function LoginBackground({ children }: Props) {
    return (
        <div className='h-screen w-screen md:bg-light-green flex justify-center items-center'>
            <div className='h-full w-full md:h-3/4 md:w-1/3  md:bg-white border-dark-green border-4 flex flex-col gap-3 justify-center items-center'>
                {children}
            </div>
        </div>
    );
}