import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"GongGong",description:"一個留給妳的空間。",robots:{index:false,follow:false},icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-Hant"><body>{children}</body></html>}
