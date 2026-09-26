"use client"
import Divider from '@/components/misc/Divider'
import ImageCropModal from '@/components/misc/ImageCropModal'
import ImagePreview from '@/components/misc/ImagePreview'
import { useAuth } from '@/hooks/auth/auth'
import { axios, axiosBase } from '@/lib/axios'
import PasswordForm from './PasswordForm'
import { Button, Card } from '@heroui/react'
import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import React, { useRef, useState } from 'react'
import { toast } from 'sonner'
import { FaImage, FaXmark } from 'react-icons/fa6'
import { FaSave } from 'react-icons/fa'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
// Límite del archivo original; el recorte se exporta a 512px en JPEG, muy por debajo de los 2 MB que valida la API
const MAX_SOURCE_IMAGE_SIZE = 10 * 1024 * 1024

export default function Config() {

    const { user, mutate } = useAuth()
    const customer = user?.customer

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [cropSource, setCropSource] = useState<string | null>(null)
    const [isRemovingImage, setIsRemovingImage] = useState(false)
    const [isSavingImage, setIsSavingImage] = useState(false)

    const currentImage = isRemovingImage ? null : user?.image_url
    const displayedImage = imagePreview ?? currentImage
    const hasImageChanges = !!imageFile || isRemovingImage

    const clearSelectedImage = () => {
        setImageFile(null)
        setImagePreview(null)
        // Permite volver a elegir el mismo archivo después de quitarlo
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        // Permite volver a elegir el mismo archivo (p. ej. tras cancelar el recorte)
        event.target.value = ""
        if (!file) return

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error('La imagen debe ser JPG, PNG o WEBP')
            return
        }
        if (file.size > MAX_SOURCE_IMAGE_SIZE) {
            toast.error('La imagen no debe pesar más de 10 MB')
            return
        }

        setCropSource(URL.createObjectURL(file))
    }

    const closeCropper = () => {
        if (cropSource) URL.revokeObjectURL(cropSource)
        setCropSource(null)
    }

    const handleCropConfirm = (file: File) => {
        closeCropper()
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
        setImageFile(file)
        setIsRemovingImage(false)
    }

    const handleRemoveImage = () => {
        // Primero se descarta la imagen seleccionada; si no hay, se marca la actual para eliminar
        if (imageFile) clearSelectedImage()
        else setIsRemovingImage(true)
    }

    const saveImage = async () => {
        if (!hasImageChanges) return

        setIsSavingImage(true)
        const loadingToast = toast.loading(imageFile ? 'Subiendo imagen...' : 'Eliminando imagen...')

        try {
            await axiosBase.get("sanctum/csrf-cookie")
            if (imageFile) {
                const formData = new FormData()
                formData.append('image', imageFile)
                await axios.post("/image", formData)
            } else {
                await axios.delete("/image")
            }
            await mutate()
            clearSelectedImage()
            setIsRemovingImage(false)
            toast.success(imageFile ? 'Imagen actualizada correctamente' : 'Imagen eliminada correctamente')
        } catch (error) {
            const response = isAxiosError(error) ? error.response : undefined
            if (response?.status === 422) {
                toast.error(response.data.errors?.image?.[0] ?? response.data.message ?? 'La imagen no es válida')
            } else if (response?.status === 429) {
                toast.error('Demasiados intentos. Espera un minuto e inténtalo de nuevo')
            } else {
                toast.error(response?.data?.message ?? 'Ocurrió un error inesperado al guardar la imagen')
            }
        } finally {
            setIsSavingImage(false)
            toast.dismiss(loadingToast)
        }
    }

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
            <Card className=' max-w-5xl mx-auto mt-6 flex md:flex-row justify-between'>
                <div className='w-full flex flex-col justify-between gap-4'>
                    <p className=' font-semibold text-xl'>Mi cuenta</p>
                    <div className='flex flex-col items-center sm:flex-row gap-4'>
                        <ImagePreview src={displayedImage} alt='Imagen de perfil' title='Imagen de perfil' className='size-52 mb-4 sm:mb-0 sm:size-40 lg:size-48 mx-auto' />
                        <div className='flex gap-5 flex-col justify-center w-full'>
                            <p className='font-semibold text-datia-gray'>{user?.customer?.name ?? ""}</p>
                            <p className=' text-sm text-datia-gray font-semibold'>Usuario: <span className=' py-1.5 px-3 bg-datia-gray/10 rounded-2xl'>{user?.name}</span></p>
                            <p className=' text-sm text-datia-gray font-semibold'>Correo: <span className=' py-1.5 px-3 bg-datia-gray/10 rounded-2xl'>{user?.email}</span></p>
                            <p></p>
                        </div>
                    </div>
                    <ImageCropModal
                        src={cropSource}
                        fileName='perfil'
                        onCancel={closeCropper}
                        onConfirm={handleCropConfirm}
                    />
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        className='hidden'
                        onChange={handleImageChange}
                    />
                    <motion.div layout className='flex flex-wrap sm:flex-nowrap gap-3'>
                        <motion.div className='w-full' layout>
                            <Button className={"w-full"} size='lg' isDisabled={isSavingImage} onPress={() => fileInputRef.current?.click()}>
                                <FaImage />
                                Seleccionar imagen
                            </Button>
                        </motion.div>
                        {
                            (displayedImage) && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        x: -10
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0
                                    }}
                                    transition={{
                                        delay: 0.15,
                                    }}
                                    layout
                                    className='w-full sm:w-fit'
                                >
                                    <Button className='w-full sm:w-fit' isDisabled={isSavingImage || !displayedImage} variant='tertiary' size='lg' onPress={handleRemoveImage}>
                                        <FaXmark />
                                        Quitar
                                    </Button>
                                </motion.div>
                            )
                        }
                        {
                            hasImageChanges && (
                                <motion.div
                                    className='w-full'
                                    layout
                                    initial={{
                                        opacity: 0,
                                        x: -10
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0
                                    }}
                                    transition={{
                                        delay: 0.3
                                    }}
                                >
                                    <Button isDisabled={!hasImageChanges} isPending={isSavingImage} onPress={saveImage} className={"w-full"} variant='secondary' size='lg'>
                                        <FaSave />
                                        Guardar cambios
                                    </Button>
                                </motion.div>
                            )
                        }
                    </motion.div>
                </div>
                <Divider variant='vertical' className='hidden md:block' />
                <Divider variant='horizontal' className='md:hidden my-4' />
                <PasswordForm />
            </Card>
            <Card className=' max-w-5xl mx-auto mt-8 flex flex-col md:flex-row justify-between md:gap-4'>
                <div className='w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start'>
                    <p className=' font-semibold text-lg sm:text-xl sm:col-span-2 mb-1 sm:mb-3'>Información de contacto y dirección</p>

                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Correo(s) electrónico(s)</p>
                        {customer?.emails?.length ? (
                            <ul className='list-disc ml-6 text-datia-gray break-all'>
                                {customer.emails.map((email: string) => (
                                    <li key={email}>{email}</li>
                                ))}
                            </ul>
                        ) : <p className='text-datia-gray ml-3 wrap-break-word'>-</p>}
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Número(s) de teléfono</p>
                        {customer?.phones?.length ? (
                            <ul className='list-disc ml-6 text-datia-gray break-all'>
                                {customer.phones.map((phone: { prefix: string | null, number: string | null }, index: number) => (
                                    <li key={index}>{[phone.prefix, phone.number].filter(Boolean).join(" ")}</li>
                                ))}
                            </ul>
                        ) : <p className='text-datia-gray ml-3 wrap-break-word'>-</p>}
                    </div>

                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Estado</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.state || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Ciudad</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.city || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Localidad</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.locality || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Colonia</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.suburb || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Calle</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.street || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Código Postal</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.code_zip || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Número Exterior</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.outer_number || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Número Interior</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.inner_number || "-"}</p>
                    </div>
                </div>
                <Divider variant='vertical' className='hidden md:block' />
                <Divider variant='horizontal' className='md:hidden my-4' />
                <div className='w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 content-start'>
                    <p className=' font-semibold text-black/80 text-lg sm:text-xl sm:col-span-2 mb-1 sm:mb-2'>Información fiscal y condiciones financieras</p>

                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Nombre</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.name || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Razón Social</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.business_name || "-"}</p>
                    </div>

                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>RFC</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{customer?.rfc || "-"}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Régimen Fiscal</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{[customer?.tax_regime, customer?.tax_regime_description].filter(Boolean).join(" - ") || "-"}</p>
                    </div>

                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Límite de crédito</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>${Number(customer?.credit_limit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className='grid gap-1 w-full min-w-0 text-sm'>
                        <p className='font-semibold text-black/80'>Plazo</p>
                        <p className='text-datia-gray ml-3 wrap-break-word'>{(customer?.early_payment_days != null ? `${customer.early_payment_days} días` : "") || "-"}</p>
                    </div>
                </div>
            </Card>
        </>
    )
}