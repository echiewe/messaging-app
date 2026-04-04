

type Props = {
    iconUrl: string
    title?: string
    onIconClick?: () => void
    aboutIcon?: boolean
    aboutPage?: () => void
    width: number
}

export default function Header({ iconUrl, title, onIconClick, aboutIcon, aboutPage, width }: Props) {
    return(
        <div className="w-full relative h-20 flex items-center justify-between px-3 bg-light-green border-b border-dark-green">
            

            <div className="absolute inset-0 flex px-3 mx-3 justify-between items-center">
                <div className="flex justify-start items-center gap-6">
                    <button
                    onClick={onIconClick ?? undefined}
                    disabled={!onIconClick}
                    >
                    <img src={iconUrl} alt='header icon' width={width}/>
                    </button>
                    {title && <h1 className="text-xl">{title}</h1>}
                </div>
                {aboutIcon && 
                <button
                onClick={aboutPage}>
                    <img src='/icons/info.png' width={20}/>
                </button>}
            </div>
            
        </div>
    );
}

            {/* ── Left end cap ── */}
            {/* <img
                src="/header/end.png"
                alt=""
                style={{
                height: "100%",
                width: "auto",
                imageRendering: "pixelated",
                flexShrink: 0,
                }}
            /> */}

            {/* ── Stretching middle — repeats a 1px slice of the green fill ── */}
            {/* <div
                className="flex-1 h-full"
                style={{
                backgroundImage: "url(/header/middle.png)", // 1px wide, full height
                backgroundRepeat: "repeat-x",
                backgroundSize: "16px 100%",
                imageRendering: "pixelated",
                }}
            /> */}

            {/* ── Right end cap (CSS-flipped so you only need one PNG) ── */}
            {/* <img
                src="/header/end.png"
                alt=""
                style={{
                height: "100%",
                width: "auto",
                imageRendering: "pixelated",
                flexShrink: 0,
                transform: "scaleX(-1)", // mirrors the left cap
                }}
            /> */}