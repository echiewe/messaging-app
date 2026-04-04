import Header from "./Header";
import NavBar from "./NavBar";

type Props = {
    children: React.ReactNode
    navBar?: boolean
    className?: string
    headerIconUrl?: string
    headerIconWidth?: number
    headerTitle?: string
    headerIconFunc?: () => void
}

export default function Background({ children, navBar=true, className, headerIconUrl, headerIconWidth, headerTitle, headerIconFunc }: Props) {
    return(
        <div className="h-screen w-screen bg-white md:bg-[#ecf0e9] flex justify-center items-center">
            <div className="h-full w-full md:h-4/5 md:w-1/4  md:bg-[#faf9f7] border-dark-green border-4 flex flex-col justify-end items-center">
                <div className="w-full flex justify-center">
                    <Header iconUrl={headerIconUrl || '/icons/icon.png'} title={headerTitle} onIconClick={headerIconFunc} width={headerIconWidth || 40} />
                </div>
                <div className={`flex-1 w-full overflow-auto ${className}`}>{children}</div>
                {navBar &&
                <div className="w-full">
                    <NavBar />
                </div>
                }
            </div>
        </div>
    );
}