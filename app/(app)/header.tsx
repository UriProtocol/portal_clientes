import Divider from "@/components/misc/Divider";
import { useAuth } from "@/hooks/auth/auth";
import { AlertDialog, Button, Drawer, Popover, Tabs } from "@heroui/react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBox, FaDollarSign, FaFileInvoice, FaHome } from "react-icons/fa";
import { FaArrowDown, FaBagShopping, FaBell, FaChevronDown, FaGear, FaListUl } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";

export default function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const [isOpenDrawer, setIsOpenDrawer] = useState(false)
    const [tab, setTab] = useState<any>("/")

    useEffect(() => {
        router.push(tab)
    }, [tab])
    useEffect(() => {
        setTab(pathname)
    }, [pathname])

    return (
        <>
            <div className=" h-16 bg-white w-full shadow grid grid-cols-12 px-3">
                <div
                    className=" col-span-2 items-center cursor-pointer hidden xl:flex"
                    onClick={() => {
                        router.push("/")
                    }}
                >
                    <Image
                        src={"/logo.jpg"}
                        alt="Logo"
                        height={62}
                        width={62}
                    />
                    <p className="font-semibold text-datia-primary/90 text-lg ml-3">
                        Proveedora De Llantas
                    </p>
                </div>
                <Drawer isOpen={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
                    <Button size="lg" className="my-auto bg-white p-7 top-1 left-3 rounded-full text-datia-primary/85 xl:hidden fixed z-50" isIconOnly>
                        <FaListUl className="scale-[1.6]" />
                    </Button>
                    <Drawer.Backdrop>
                        <Drawer.Content placement="left">
                            <Drawer.Dialog className="w-full">
                                <Drawer.CloseTrigger /> {/* Optional: Close button */}
                                <Drawer.Header>
                                    <Drawer.Heading>
                                        <div className="flex flex-col gap-2 items-center mt-8">
                                            <Image
                                                src={"/logo.jpg"}
                                                alt="Logo"
                                                height={200}
                                                width={200}
                                                onClick={() => {
                                                    router.push("/")
                                                }}
                                            />
                                        </div>
                                    </Drawer.Heading>
                                </Drawer.Header>
                                <Drawer.Body>
                                    <Tabs className="w-full ml-1 mt-8" variant="secondary" orientation="vertical" align="start" selectedKey={tab} onSelectionChange={setTab}>
                                        <Tabs.ListContainer className="">
                                            <Tabs.List
                                                className="
                                                    **:data-[slot=tabs-tab]:h-16
                                                    **:data-[slot=tabs-tab]:text-datia-gray
                                                    **:data-[slot=tabs-tab]:data-[selected=true]:text-datia-primary/80
                                                    **:data-[slot=tabs-tab]:data-[selected=true]:font-semibold
                                                    **:data-[slot=tabs-indicator]:bg-datia-primary
                                                    **:data-[slot=tabs-indicator]:w-1 
                                                    **:data-[slot=tabs-indicator]:rounded-xl
                                                "
                                            >
                                                <Tabs.Tab id="/" onPress={() => setIsOpenDrawer(false)}>
                                                    <FaHome className=" mr-2 text-3xl" />
                                                    <p className=" text-3xl">Inicio</p>
                                                    <Tabs.Indicator />
                                                </Tabs.Tab>
                                                <Tabs.Tab  id="/pedidos" onPress={() => setIsOpenDrawer(false)}>
                                                    <FaBagShopping className=" mr-2 text-3xl text-yellow-600/80" />
                                                    <p className={clsx(" text-3xl text-yellow-600/65", tab =="/pedidos" && "text-yellow-600")}>Haz tu pedido</p>
                                                    <Tabs.Indicator className=" bg-yellow-600!"/>
                                                </Tabs.Tab>
                                                <Tabs.Tab id="/seguimiento" onPress={() => setIsOpenDrawer(false)}>
                                                    <FaBox className=" mr-3 text-3xl" />
                                                    <p className=" text-3xl">Seguimiento</p>
                                                    <Tabs.Indicator />
                                                </Tabs.Tab>
                                                <Tabs.Tab id="/estado-cuenta" onPress={() => setIsOpenDrawer(false)}>
                                                    <FaDollarSign className=" mr-2 text-3xl" />
                                                    <p className=" text-3xl">Estado de cuenta</p>
                                                    <Tabs.Indicator />
                                                </Tabs.Tab>
                                                <Tabs.Tab id="/facturas" onPress={() => setIsOpenDrawer(false)}>
                                                    <FaFileInvoice className=" mr-2 text-3xl" />
                                                    <p className=" text-3xl">Facturas</p>
                                                    <Tabs.Indicator />
                                                </Tabs.Tab>
                                            </Tabs.List>
                                        </Tabs.ListContainer>
                                    </Tabs>
                                </Drawer.Body>
                                <Drawer.Footer />
                            </Drawer.Dialog>
                        </Drawer.Content>
                    </Drawer.Backdrop>
                </Drawer>
                <div className="fixed top-1 right-3 flex gap-2 items-center justify-end z-50 rounded-2xl">
                    <Popover>
                        <Popover.Trigger>
                            <div className="p-1.5 bg-white rounded-full">
                                <Button
                                    isIconOnly
                                    size="lg"
                                    variant="primary"
                                    className=""
                                >
                                    <FaBell />
                                    <div className="absolute h-4 w-4 -top-0.5 -right-0.5 bg-red-600 rounded-full border-2">
                                    </div>
                                </Button>
                            </div>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Popover.Dialog>
                                <Popover.Heading className="font-semibold mb-1">Notificaciones</Popover.Heading>
                                <Divider />
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>

                    <Popover>
                        <Popover.Trigger>
                            <div className="p-1.5 rounded-4xl bg-white">
                                <Button
                                    variant="tertiary"
                                    size="lg"
                                    className="px-6"
                                >
                                    Mi perfil
                                    <FaChevronDown className=" ml-2" />
                                </Button>
                            </div>
                        </Popover.Trigger>
                        <Popover.Content>
                            <Popover.Dialog>
                                <Popover.Heading className="font-semibold">{user?.name} - {user?.customer?.name}</Popover.Heading>
                                <div className="flex flex-col">
                                    <Button fullWidth className="rounded-md mt-2 mb-1 bg-transparent hover:bg-datia-gray/20 text-black/70 flex justify-evenly" onPress={() => router.push("/config")}>
                                        <p className="text-center">
                                            Configuración
                                        </p>
                                        <FaGear className="text-black/60 " />
                                    </Button>
                                    <Divider />
                                    <AlertDialog>
                                        <Button fullWidth className="rounded-md bg-transparent text-red-700 hover:bg-red-100 mt-1 flex justify-evenly">
                                            Cerrar sesión
                                            <MdLogout />
                                        </Button>
                                        <AlertDialog.Backdrop>
                                            <AlertDialog.Container>
                                                <AlertDialog.Dialog className="sm:max-w-100">
                                                    <AlertDialog.CloseTrigger />
                                                    <AlertDialog.Header>
                                                        <AlertDialog.Heading>¿Estás seguro de que quieres cerrar sesión?</AlertDialog.Heading>
                                                    </AlertDialog.Header>
                                                    <AlertDialog.Body>
                                                        <p>
                                                            Necesitarás volver a introducir tus credenciales para entrar al sistema
                                                        </p>
                                                    </AlertDialog.Body>
                                                    <AlertDialog.Footer>
                                                        <Button slot="close" variant="tertiary">
                                                            Cancelar
                                                        </Button>
                                                        <Button slot="close" variant="danger" onPress={logout}>
                                                            Cerrar sesión
                                                        </Button>
                                                    </AlertDialog.Footer>
                                                </AlertDialog.Dialog>
                                            </AlertDialog.Container>
                                        </AlertDialog.Backdrop>
                                    </AlertDialog>
                                </div>
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>
                </div>
            </div>
            <div className="bg-white p-1.5 fixed left-1/2 -translate-x-1/2 top-1.5 hidden xl:block z-50 w-full max-w-4xl rounded-3xl">
                <Tabs className="w-full" variant="primary" selectedKey={tab} onSelectionChange={setTab}>
                    <Tabs.ListContainer className=" bg-transparent">
                        <Tabs.List
                            className="
                                **:data-[slot=tabs-tab]:text-datia-gray
                                **:data-[slot=tabs-tab]:data-[selected=true]:text-white
                                **:data-[slot=tabs-indicator]:bg-datia-primary
                            "
                        >
                            <Tabs.Tab id="/">
                                <Link href={"/"} className=" text-[1.05rem] w-full">Inicio</Link>
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="/pedidos">
                                <Link href={"/pedidos"} className={clsx(" text-[1.05rem] text-yellow-600", tab == "/pedidos" && "text-white!")}>Haz tu pedido</Link>
                                <Tabs.Separator/>
                                <Tabs.Indicator className="bg-yellow-600!"/>
                            </Tabs.Tab>
                            <Tabs.Tab id="/seguimiento">
                                <Link href={"/seguimiento"} className=" text-[1.05rem]">Seguimiento</Link>
                                <Tabs.Separator/>
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="/estado-cuenta">
                                <Link href={"/estado-cuenta"} className=" text-[1.05rem]">Estado de cuenta</Link>
                                <Tabs.Separator/>
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="/facturas">
                                <Link href={"/facturas"} className=" text-[1.05rem]">Facturas</Link>
                                <Tabs.Separator/>
                                <Tabs.Indicator />
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                </Tabs>
            </div>
        </>
    )
}