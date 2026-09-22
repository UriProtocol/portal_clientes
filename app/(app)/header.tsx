import Divider from "@/components/misc/Divider";
import { useAuth } from "@/hooks/auth/auth";
import { AlertDialog, Button, Drawer, Popover, Tabs } from "@heroui/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBox, FaDollarSign, FaFileInvoice, FaHome } from "react-icons/fa";
import { FaBagShopping, FaBell, FaChevronDown, FaGear, FaListUl } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import type { IconType } from "react-icons";


export default function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const [isOpenDrawer, setIsOpenDrawer] = useState(false)
    const [tab, setTab] = useState<any>("/")
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        router.push(tab)
    }, [tab])
    useEffect(() => {
        setTab(pathname)
    }, [pathname])
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 30)
        handleScroll()
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>

            <div className={
                clsx(
                    " h-19 fixed w-full top-0 bg-datia-gray/10 backdrop-blur-[3px] hidden xl:block z-40",
                    !isScrolled && "opacity-0 -z-50"
                )} />
            <div className=" h-16 bg-white w-full shadow grid grid-cols-12 px-3">
                <motion.div
                    className={clsx(
                        "col-span-2 items-center cursor-pointer hidden xl:flex fixed top-1 left-4 z-50 transition-all",
                        isScrolled && "top-3 left-5"

                    )}
                    onClick={() => {
                        router.push("/")
                    }}
                    initial={{
                        x: -20,
                        opacity: 0
                    }}
                    animate={{
                        x: 0,
                        opacity: 1
                    }}
                >
                    <Image
                        src={"/logo.jpg"}
                        alt="Logo"
                        height={62}
                        width={62}
                        className=" rounded-full"
                    />
                    <p className={clsx(
                        "font-semibold text-datia-primary/90 text-lg ml-3 transition-all",
                        isScrolled && "opacity-0"
                    )}>
                        Portal de Clientes
                    </p>
                </motion.div>
                <Drawer isOpen={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
                    <motion.div
                        initial={{
                            x: -20,
                            opacity: 0
                        }}
                        animate={{
                            x: 0,
                            opacity: 1
                        }}
                        className="my-auto top-1 left-3 rounded-full  xl:hidden fixed z-50"
                    >
                        <Button size="lg" className="bg-white p-7 text-datia-primary/85" isIconOnly>
                            <FaListUl className="scale-[1.6]" />
                        </Button>
                    </motion.div>
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
                                                <Tabs.Tab id="/pedidos" onPress={() => setIsOpenDrawer(false)}>
                                                    <FaBagShopping className=" mr-2 text-3xl text-datia-secondary/80" />
                                                    <p className={clsx(" text-3xl text-datia-secondary/65", tab == "/pedidos" && "text-datia-secondary")}>Haz tu pedido</p>
                                                    <Tabs.Indicator className=" bg-datia-setext-datia-secondary!" />
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
                <div
                    className={clsx(
                        "fixed top-1 right-3 flex gap-2 items-center justify-end z-50 rounded-2xl transition-all",
                        isScrolled && "top-3 right-4"
                    )}
                >
                    <Popover>
                        <Popover.Trigger>
                            <motion.div
                                className={clsx("p-1.5 bg-white rounded-full", isScrolled && "shadow-lg")}
                                initial={{
                                    x: 10,
                                    opacity: 0
                                }}
                                animate={{
                                    x: 0,
                                    opacity: 1
                                }}
                                transition={{
                                    delay: 0.1
                                }}
                            >
                                <Button
                                    isIconOnly
                                    size="lg"
                                    variant="primary"
                                    className=""
                                >
                                    <FaBell />
                                    <div className="absolute h-4 w-4 -top-0.5 -right-0.5 bg-red-600 rounded-full border-2 border-white">
                                    </div>
                                </Button>
                            </motion.div>
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
                            <motion.div
                                className={clsx("p-1.5 rounded-4xl bg-white", isScrolled && "shadow")}
                                initial={{
                                    x: 20,
                                    opacity: 0
                                }}
                                animate={{
                                    x: 0,
                                    opacity: 1
                                }}
                            >
                                <Button
                                    variant="tertiary"
                                    size="lg"
                                    className="px-6"
                                >
                                    Mi perfil
                                    <FaChevronDown className=" ml-2" />
                                </Button>
                            </motion.div>
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
            <motion.div
                className={clsx(
                    "bg-white p-1.5 fixed hidden xl:block z-50 w-full max-w-4xl rounded-3xl transition-shadow duration-300 ease-out",
                    isScrolled && "shadow"
                )}
                initial={{
                    opacity: 0,
                    top: isScrolled ? 12 : 6,
                    left: isScrolled ? 16 : "50%",
                    x: isScrolled ? 0 : "-50%",
                }}
                animate={{
                    top: isScrolled ? 12 : 6,
                    left: isScrolled ? 95 : "50%",
                    x: isScrolled ? 0 : "-50%",
                    opacity: 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            >
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
                                <Link href={"/"} className=" text-[1.05rem] w-full flex items-center justify-center gap-1.5">
                                    <FaHome className=" mr-2 text-lg"/>
                                    Inicio
                                </Link>
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="/pedidos">
                                <Link href={"/pedidos"} className={clsx(" text-[1.05rem] text-datia-secondary flex items-center justify-center gap-1.5 text-nowrap", tab == "/pedidos" && "text-white!")}>
                                    <FaBagShopping className=" mr-2 text-lg"/>
                                    Haz tu pedido
                                </Link>
                                <Tabs.Separator />
                                <Tabs.Indicator className="bg-datia-secondary!" />
                            </Tabs.Tab>
                            <Tabs.Tab id="/seguimiento">
                                <Link href={"/seguimiento"} className=" text-[1.05rem] flex items-center justify-center gap-1.5">
                                    <FaBox className=" mr-2 text-lg"/>
                                    Seguimiento
                                </Link>
                                <Tabs.Separator />
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="/estado-cuenta">
                                <Link href={"/estado-cuenta"} className=" text-[1.05rem] flex items-center justify-center gap-1.5 text-nowrap">
                                    <FaDollarSign className=" mr-2 text-lg"/>
                                    Estado de cuenta
                                </Link>
                                <Tabs.Separator />
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="/facturas">
                                <Link href={"/facturas"} className=" text-[1.05rem] flex items-center justify-center gap-1.5">
                                    <FaFileInvoice className=" mr-2 text-lg"/>
                                    Facturas
                                </Link>
                                <Tabs.Separator />
                                <Tabs.Indicator />
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                </Tabs>
            </motion.div>
        </>
    )
}