
import { Card} from "@heroui/react";

interface AuthCardProps {
	logo?: React.ReactNode;
	children: React.ReactNode;
}  

export default function AuthCard({ logo, children }: AuthCardProps) {
	return (
		<div className="min-h-screen flex flex-col justify-center items-center">
			 <Card className="p-6 border-none bg-white/95 shadow-none sm:shadow-small min-w-full sm:min-w-[550px] h-screen fixed sm:relative sm:h-auto rounded-none sm:rounded-xl backdrop-blur-md" >
				<Card.Header className="flex-col items-center ">
					{logo}
					<h4 className={`font-semibold text-2xl mb-4 flex justify-start antialiased text-datia-primary`}>¡Bienvenido!</h4>
					<h4 className={` mb-4 flex justify-start antialiased text-datia-primary/40`}>Inicia sesión con tus credenciales</h4>
				</Card.Header>
				<Card.Content className="overflow-visible py-2 pb-6 justify-center">
					<div className=" mx-auto mb-4 -mt-16 sm:hidden">{logo}</div>
					{children}
				</Card.Content>
			</Card>
    	</div>
	);
}