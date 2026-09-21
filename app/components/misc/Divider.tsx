export default function Divider({className = ""}: {className?: string}){
    return (
        <div className={`h-0.5 bg-datia-primary/10 ${className} max-w-6xl mx-auto`}></div>
    )
}