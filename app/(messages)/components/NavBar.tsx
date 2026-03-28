'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { label: 'Chats', href: '/messages', border: 'border-r border-dark-green' },
    { label: 'Profile', href: '/profile', border: 'border-l border-dark-green' },
];

export default function NavBar() {
    const pathname = usePathname();
    
    return(
        <div className="w-full h-15 bg-light-green flex justify-between items-center shadow-[0_-4px_6px_rgba(0,0,0,0.1)]">
            {tabs.map(({ label, href, border }) => {
                const isActive = pathname === href
                return (
                <Link
                    key={href}
                    href={href}
                    className={`
                    nav-button ${border}
                    font-semibold transition-colors duration-150
                    ${isActive
                        ? 'text-dark-green underline underline-offset-4'
                        : 'text-dark-green/50 hover:text-dark-green'
                    }
                    `}
                >
                    {label}
                </Link>
                )
            })}
        </div>
    );
}