export default function Divider({className = ""}: {className?: string}){
    return (
        <div className={`h-[0.1rem] bg-datia-gray/30 ${className}`}></div>
    )
}