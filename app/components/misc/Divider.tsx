export default function Divider({className = "", variant = "horizontal"}: {className?: string, variant?: "vertical" | "horizontal"}){

    if(variant === "horizontal"){
        return (
            <div className={`h-0.5 bg-datia-primary/10 ${className} max-w-6xl mx-auto w-full`} />
        )
    }
    return <div className={`w-0.5 shrink-0 self-stretch bg-datia-primary/10 ${className}`} />
}