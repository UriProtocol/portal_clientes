"use client"
/* eslint-disable @next/next/no-img-element */
import { Modal } from "@heroui/react"
import { useState } from "react"

const PLACEHOLDER_SRC = "/placeholder-image.svg"

export interface ImagePreviewProps {
    src?: string | null
    alt?: string
    /** Classes for the thumbnail (size, rounding, etc.) */
    className?: string
    /** Layout classes for the outer element (margins, alignment) */
    wrapperClassName?: string
    /** Optional title shown in the modal header */
    title?: string
}

export default function ImagePreview({ src, alt = "Imagen", className = "size-24", wrapperClassName = "", title }: ImagePreviewProps) {

    // Si la imagen falla al cargar se trata igual que si no hubiera url
    const [failedSrc, setFailedSrc] = useState<string | null>(null)
    const hasImage = !!src && failedSrc !== src

    const thumbnail = (
        <img
            src={hasImage ? src : PLACEHOLDER_SRC}
            alt={hasImage ? alt : "Sin imagen"}
            onError={() => src && setFailedSrc(src)}
            className={`shrink-0 object-cover rounded-xl bg-datia-gray/10 ${hasImage ? "" : wrapperClassName} ${className}`}
        />
    )

    // Sin imagen no hay nada que ampliar; la miniatura es el elemento exterior
    if (!hasImage) return thumbnail

    return (
        <Modal>
            {/* shrink-0: sin él, dentro de un flex-row el trigger se encoge y el max-width: 100% del img lo deforma */}
            <Modal.Trigger className={`w-fit shrink-0 cursor-zoom-in transition-opacity hover:opacity-80 ${wrapperClassName}`}>
                {thumbnail}
            </Modal.Trigger>
            <Modal.Backdrop>
                <Modal.Container size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        {title && (
                            <Modal.Header>
                                <Modal.Heading>{title}</Modal.Heading>
                            </Modal.Header>
                        )}
                        <Modal.Body className="flex items-center justify-center">
                            <img
                                src={src}
                                alt={alt}
                                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
                            />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
