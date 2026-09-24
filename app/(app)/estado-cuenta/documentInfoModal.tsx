import { Button, Modal, Tooltip } from "@heroui/react";
import { FaCircleInfo } from "react-icons/fa6";
import clsx from "clsx";
import { useMemo } from "react";
import Divider from "@/components/misc/Divider";
import type { StatementDocument, StatementMovement } from "./page";

export function formatDate(value?: string | null) {
    if (!value) return "-"
    // Fechas sin hora ("YYYY-MM-DD") se formatean sin pasar por Date para evitar el corrimiento por zona horaria
    if (value.length <= 10) {
        const [year, month, day] = value.split("-")
        return `${day}/${month}/${year}`
    }
    return new Date(value).toLocaleDateString("es-MX")
}

export function formatCurrency(value: number | string) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(Number(value ?? 0))
}

export function getDocumentStatus(doc: StatementDocument) {
    if (doc.balance == 0) return "Pagado"
    if (doc.balance < doc.charges) return "Parcial"
    return "Crédito"
}

function hasValue(value?: string | number | null) {
    return value !== undefined && value !== null && value !== "" && value !== "No tiene"
}

interface MovementSectionProps {
    title: string
    // Encabezados de las columnas de folio y referencia de cada tipo de movimiento
    folioLabel: string
    referenceLabel: string
    movements: StatementMovement[]
}

function MovementSection({ title, folioLabel, referenceLabel, movements }: MovementSectionProps) {
    if (!movements.length) return null

    const total = movements.reduce((acc, m) => acc + Number(m.amount ?? 0), 0)

    return (
        <div className="grid mt-4">
            <p className=" mb-3 font-semibold text-base">{title}</p>
            <div className="grid grid-cols-4 gap-x-3 min-w-sm">
                <p>{folioLabel}</p>
                <p>Fecha</p>
                <p>{referenceLabel}</p>
                <p className="text-right">Importe</p>
                <div className="col-span-4 my-1">
                    <Divider className="h-px!" />
                </div>
                {
                    movements.map((movement, index) => {
                        return (
                            <div key={movement.uuid ?? `${movement.type}-${movement.id_origin}-${index}`} className=" py-0.5 col-span-4 grid grid-cols-4 gap-x-3 text-[0.8rem] items-center min-w-sm">
                                <div className="font-semibold">{hasValue(movement.id_origin) ? movement.id_origin : "-"}</div>
                                <div>{formatDate(movement.date)}</div>
                                <div>{hasValue(movement.invoice) ? movement.invoice : "No tiene"}</div>
                                <div className="text-right text-green-800">{formatCurrency(movement.amount)}</div>
                            </div>
                        )
                    })
                }
                {
                    movements.length > 1 && (
                        <>
                            <div className="col-span-4 my-1">
                                <Divider className="h-px!" />
                            </div>
                            <p className="col-span-3 text-right text-sm">Total</p>
                            <p className="text-right text-sm font-semibold text-green-800">{formatCurrency(total)}</p>
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default function DocumentInfoModal({ document: doc }: { document: StatementDocument }) {

    const { deposits, creditNotes, returns } = useMemo(() => ({
        deposits: doc.movements.filter(m => m.type === "deposit"),
        creditNotes: doc.movements.filter(m => m.type === "credit_note"),
        returns: doc.movements.filter(m => m.type === "return"),
    }), [doc.movements])

    const status = getDocumentStatus(doc)

    return (
        <>
            <Modal>
                <Tooltip delay={200}>
                    <Tooltip.Trigger>
                        <Button isIconOnly className={"bg-datia-gray/70 text-white/85"} variant="tertiary" >
                            <FaCircleInfo className=" scale-125" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        Detalle del documento
                    </Tooltip.Content>
                </Tooltip>
                <Modal.Backdrop>
                    <Modal.Container size="lg">
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading>Detalle del documento  ·
                                    <span className="font-semibold ml-1">
                                        {doc.branch}-{doc.id}
                                    </span>
                                </Modal.Heading>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="p-4 bg-datia-gray/10 rounded-2xl grid grid-cols-3 gap-3 items-start min-w-sm overflow-x-auto">
                                    <div className="grid col-span-2">
                                        <p className="font-semibold text-lg mb-1">Documento {doc.branch} - {doc.id}</p>
                                        <p className="text-sm">Factura</p>
                                        <p className="font-semibold mb-2">{doc.invoice}</p>
                                        <p className="text-sm">Estatus</p>
                                        <p className="font-semibold">{status}</p>
                                    </div>
                                    <div className="grid">
                                        <p className="text-right text-sm">Fecha</p>
                                        <p className="text-right font-semibold mb-2">{formatDate(doc.date)}</p>
                                        <p className="text-right text-sm">Vencimiento</p>
                                        <p className="text-right font-semibold ">{formatDate(doc.dueDate)}</p>
                                    </div>
                                    <div className="col-span-3 grid gap-3 grid-cols-3">
                                        <div className="col-span-3">
                                            <Divider />
                                        </div>
                                        <div className="grid">
                                            <p className="text-sm">Cargos</p>
                                            <p className="font-semibold text-base">{formatCurrency(doc.charges)}</p>
                                        </div>
                                        <div className="grid text-center">
                                            <p className="text-sm">Abonos</p>
                                            <p className="font-semibold text-base text-green-800">{formatCurrency(doc.payments)}</p>
                                        </div>
                                        <div className="grid text-right">
                                            <p className="text-sm">Saldo</p>
                                            <p className={clsx("font-semibold text-base", doc.balance > 0 ? "text-red-800" : "text-green-800")}>
                                                {formatCurrency(doc.balance)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <MovementSection
                                    title="Pago(s) del documento:"
                                    folioLabel="Referencia"
                                    referenceLabel="Complemento"
                                    movements={deposits}
                                />
                                <MovementSection
                                    title="Nota(s) de crédito del documento:"
                                    folioLabel="Folio"
                                    referenceLabel="Factura"
                                    movements={creditNotes}
                                />
                                <MovementSection
                                    title="Devolución(es) del documento:"
                                    folioLabel="Folio"
                                    referenceLabel="Nota de crédito"
                                    movements={returns}
                                />
                            </Modal.Body>
                            <Modal.Footer />
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    )
}
