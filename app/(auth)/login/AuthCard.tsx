
import { Card} from "@heroui/react";

interface AuthCardProps {
	logo?: React.ReactNode;
	children: React.ReactNode;
}

export default function AuthCard({ logo, children }: AuthCardProps) {
	return (
		<Card className="relative overflow-hidden p-6 sm:p-8 border-none bg-white shadow-2xl shadow-datia-primary/10 ring-1 ring-slate-200/70 rounded-2xl">
			<div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-datia-primary to-yellow-500" />
			<Card.Header className="flex-col items-start gap-1">
				{logo}
				<h4 className="font-bold text-3xl tracking-tight antialiased text-datia-primary">¡Bienvenido!</h4>
				<p className="antialiased text-slate-500">Inicia sesión con tus credenciales</p>
			</Card.Header>
			<Card.Content className="overflow-visible pt-4 pb-2">
				{children}
			</Card.Content>
		</Card>
	);
}
