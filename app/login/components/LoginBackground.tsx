type Props = {
    children: React.ReactNode
}

export default function LoginBackground({ children }: Props) {
    return (
        <div className='h-screen w-screen md:bg-light-grey-green flex justify-center items-center'>
            <div className='h-full w-full md:h-3/4 md:w-1/3  md:bg-off-white border-dark-green border-2 flex flex-col gap-3 justify-center items-center'>
                {children}
            </div>
        </div>
    );
}