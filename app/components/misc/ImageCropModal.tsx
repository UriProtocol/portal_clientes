"use client"
import { Button, Label, Modal, Slider } from "@heroui/react"
import { useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { FaCheck, FaXmark } from "react-icons/fa6"

// Tamaño máximo del lado de la imagen recortada; suficiente para un avatar y ligero para subir
const OUTPUT_SIZE = 512

export interface ImageCropModalProps {
    /** Imagen a recortar (data URL u object URL). El modal se abre cuando hay src */
    src: string | null
    /** Nombre base del archivo generado */
    fileName?: string
    onCancel: () => void
    onConfirm: (file: File) => void
}

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
})

async function cropToFile(src: string, area: Area, fileName: string) {
    const image = await loadImage(src)
    const size = Math.min(OUTPUT_SIZE, Math.round(area.width))

    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas no disponible")

    // JPEG no tiene transparencia: se rellena de blanco para que los PNG no queden en negro
    context.fillStyle = "#fff"
    context.fillRect(0, 0, size, size)
    context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size)

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9))
    if (!blob) throw new Error("No se pudo generar la imagen")

    return new File([blob], `${fileName}.jpg`, { type: "image/jpeg" })
}

export default function ImageCropModal({ src, fileName = "imagen", onCancel, onConfirm }: ImageCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedArea, setCroppedArea] = useState<Area | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const reset = () => {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedArea(null)
    }

    const handleCancel = () => {
        reset()
        onCancel()
    }

    const handleConfirm = async () => {
        if (!src || !croppedArea) return
        setIsProcessing(true)
        try {
            const file = await cropToFile(src, croppedArea, fileName)
            reset()
            onConfirm(file)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Modal isOpen={!!src} onOpenChange={open => !open && handleCancel()}>
            <Modal.Backdrop isDismissable={false}>
                <Modal.Container size="md">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Recortar imagen</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="flex flex-col gap-4">
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-datia-gray/10">
                                {src && (
                                    <Cropper
                                        image={src}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        minZoom={1}
                                        maxZoom={3}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={(_, areaPixels) => setCroppedArea(areaPixels)}
                                    />
                                )}
                            </div>
                            <Slider
                                aria-label="Zoom"
                                value={zoom}
                                onChange={value => setZoom(value as number)}
                                minValue={1}
                                maxValue={3}
                                step={0.01}
                                // El inicio del track relleno es un border-inline-start de HeroUI pintado con --accent,
                                // no el Slider.Fill; sobrescribir la variable colorea fill y bordes por igual
                                className="w-full [--accent:var(--color-datia-primary)]"
                            >
                                <Label>Zoom</Label>
                                <Slider.Track className={'bg-datia-primary/10'}>
                                    <Slider.Fill />
                                    <Slider.Thumb className={"bg-datia-primary"}/>
                                </Slider.Track>
                            </Slider>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="tertiary" onPress={handleCancel} isDisabled={isProcessing}>
                                <FaXmark />
                                Cancelar
                            </Button>
                            <Button onPress={handleConfirm} isDisabled={!croppedArea} isPending={isProcessing}>
                                <FaCheck />
                                Aplicar recorte
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
