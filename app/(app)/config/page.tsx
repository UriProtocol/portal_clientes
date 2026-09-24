"use client"
import Divider from '@/components/misc/Divider'
import ImagePreview from '@/components/misc/ImagePreview'
import { useAuth } from '@/hooks/auth/auth'
import { Button, Card } from '@heroui/react'
import {motion} from 'framer-motion'
import { FaSave } from 'react-icons/fa'
import { FaImage, FaX, FaXmark } from 'react-icons/fa6'

export default function Config(){

    const {user} = useAuth()

    return (
        <>
            <div className="max-w-4xl mx-auto mt-2">
                <motion.h1
                        className="font-semibold text-4xl"
                        initial={{
                            y: -10,
                            opacity: 0
                        }}
                        animate={{
                            y: 0,
                            opacity: 1
                        }}
                    >
                        Configuración
                    </motion.h1>
                    <motion.h2
                        initial={{
                            y: -10,
                            opacity: 0
                        }}
                        animate={{
                            y: 0,
                            opacity: 1
                        }}
                        transition={{
                            delay: 0.2
                        }}
                        className="text-datia-gray my-3"
                    >
                        Administra la imagen de perfil y la contraseña de acceso al portal. Revisa tus datos y tu información fiscal
                    </motion.h2>
            </div>
            <Divider />
            <Card className=' max-w-5xl mx-auto mt-4 flex flex-row justify-between'>
                <div className='w-full grid gap-4'>
                    <p className=' font-semibold text-xl'>Mi cuenta</p>
                    <div className='flex gap-4'>
                        <ImagePreview className='size-40'/>
                        <div className='flex gap-5 flex-col justify-center'>
                            <p className='font-semibold text-datia-gray'>{user?.customer?.name ?? ""}</p>
                            <p className=' text-sm text-datia-gray font-semibold'>Usuario: <span className=' py-1.5 px-3 bg-datia-gray/10 rounded-2xl'>{user?.name}</span></p>
                            <p className=' text-sm text-datia-gray font-semibold'>Correo: <span className=' py-1.5 px-3 bg-datia-gray/10 rounded-2xl'>{user?.email}</span></p>
                            <p></p>
                        </div>
                    </div>
                    <motion.div layout className='flex gap-4'>
                        <Button className={"w-full"} size='lg'>
                            <FaImage />
                            Subir imagen
                        </Button>
                        {/* <Button variant='tertiary' size='lg'>
                            <FaXmark />
                            Quitar
                        </Button>
                        <Button isDisabled className={"w-full"} variant='secondary' size='lg'>
                            <FaSave />
                            Guardar cambios
                        </Button> */}
                    </motion.div>
                </div>
                <Divider variant='vertical'/>
                <div className='w-full'>asdasd</div>
            </Card>
            <Card className=' max-w-5xl mx-auto mt-4 grid gap-4 grid-cols-2'>
                <p className=' font-semibold text-xl'>Datos e información fiscal</p>
            </Card>
        </>
    )
}