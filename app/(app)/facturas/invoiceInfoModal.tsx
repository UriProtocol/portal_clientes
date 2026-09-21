import { Button, Modal, Tooltip } from "@heroui/react";
import { FaCircleInfo } from "react-icons/fa6";
import { Invoice } from "./page";

export default function InvoiceInfoModal({ invoice }: { invoice: Invoice }) {
    return (
        <>
            <Modal>
                <Tooltip delay={200}>
                    <Tooltip.Trigger>
                        <Button isIconOnly className={"ml-3 bg-datia-gray/70 text-white/85"} variant="tertiary" >
                            <FaCircleInfo className=" scale-125" />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        Documentos asociados
                    </Tooltip.Content>
                </Tooltip>
                <Modal.Backdrop>
                    <Modal.Container>
                        <Modal.Dialog>
                            <Modal.CloseTrigger /> {/* Optional: Close button */}
                            <Modal.Header>
                                <Modal.Heading>Documentos asociados de la factura: 
                                    <span className="font-semibold ml-2">
                                        {invoice.serie}-{invoice.folio}
                                    </span>
                                </Modal.Heading>
                            </Modal.Header>
                            <Modal.Body />
                            <Modal.Footer />
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    )
}