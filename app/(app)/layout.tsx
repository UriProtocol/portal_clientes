"use client"

import Header from "./header"


export default function Layout({children}: {children: React.ReactNode}) {

    return (
        <div className=" w-full min-h-screen bg-datia-primary/7.5">
            <Header />
            <div className="p-8">
                {children}
            </div>
        </div>
    )
}