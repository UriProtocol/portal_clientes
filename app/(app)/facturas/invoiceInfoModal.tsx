import { Button, Modal, Tooltip } from "@heroui/react";
import { FaCircleInfo, FaFilePdf, FaPrint } from "react-icons/fa6";
import { Invoice, PaymentComplement } from "./page";
import { XMLParser } from "fast-xml-parser";
import { useCallback, useMemo } from "react";
import Divider from "@/components/misc/Divider";
import { LuCodeXml } from "react-icons/lu";
import { toast } from "sonner";
import { axios } from "@/lib/axios";

const parser = new XMLParser({
    ignoreAttributes: false,   // CFDI stores almost everything in attributes
    attributeNamePrefix: "",   // so you get .Total instead of ["@_Total"]
    removeNSPrefix: true,      // "cfdi:Comprobante" -> "Comprobante"
    parseAttributeValue: false,// keep "3055.00" as a string (safer for money/RFCs/folios)
    isArray: (name) =>
        ["Concepto", "Traslado", "Retencion"].includes(name), // always arrays, even if there is only one
});

interface Complement extends PaymentComplement {
    amount: number
}

export default function InvoiceInfoModal({ invoice }: { invoice: Invoice }) {

    const handleDownloadXML = useCallback((xml: string, name: string) => {
        if (!xml) return
        const blob = new Blob([xml], { type: "text/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}_${invoice.serie}_${invoice.folio}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [])

    const handleDownloadPDF = useCallback(async (uuid: string, type: "paymentComplement" | "creditNote") => {
        const loadingToast = toast.loading("Generando PDF del comprobante")
        axios.get(`/${type}/${uuid}/pdf`)
            .then((response) => {

                const base64String = response.data?.ObtenerPDFResult?.PDFResultado;

                if (!base64String) {
                    console.error(response)
                    toast.error('Hubo un error al obtener el PDF de la nota de crédito')
                    return
                }

                const byteCharacters = atob(base64String);
                const byteNumbers = new Array(byteCharacters.length).fill(null).map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });

                const url = window.URL.createObjectURL(
                    blob
                );

                const newWindow = window.open(url, "_blank");

                if (newWindow) {
                    newWindow.onload = () => {
                        newWindow.focus();
                        newWindow.print();
                    };
                } else {
                    alert(
                        "Tu navegador bloqueó la ventana emergente. Permite ventanas emergentes para ver el PDF."
                    );
                    console.error("No se pudo abrir la nueva ventana.");
                }
            })
            .catch(error => {
                toast.error('Hubo un error al generar el pdf')
                console.error(error)
            }).finally(() => {
                toast.dismiss(loadingToast)
            })
    }, [])

    const handlePrintPDF = useCallback(async (uuid: any) => {
        const openAndPrint = (base64: string) => {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const url = window.URL.createObjectURL(
                new Blob([bytes], { type: "application/pdf" })
            );

            const newWindow = window.open(
                url,
                "PrintWindow",
                "toolbar=no,scrollbars=no,resizable=no,top=100,left=100,width=800,height=600"
            );

            if (newWindow) {
                newWindow.onload = () => {
                    newWindow.focus();
                    newWindow.print();
                };
            } else {
                alert("Tu navegador bloqueó la ventana emergente. Permite ventanas emergentes para ver el PDF.");
            }
        };

        const loadingToast = toast.loading("Generando ticket PDF...");

        try {
            const data = await axios.get(`/tickets/${uuid}/new/printTextPDF`).then(r => r.data)

            const pages: string[] = Array.isArray(data.pdfs) ? data.pdfs : [data.pdfs];

            if (pages.length === 1) {
                openAndPrint(pages[0]);
                return;
            }

            // Multi-page: print first immediately, confirm each subsequent page
            openAndPrint(pages[0]);

            for (let i = 1; i < pages.length; i++) {
                openAndPrint(pages[i]);
            }

        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Ocurrió un error inesperado al generar el ticket PDF');
            console.error(err);
        } finally {
            toast.dismiss(loadingToast)
        }
    }, []);

    const xml = useMemo(() => {
        if (!invoice.xml) return null
        return parser.parse(invoice.xml).Comprobante
    }, [invoice.xml])

    const balance = useMemo(() => {
        const amount = invoice.tickets?.reduce((acc: any, cur: any) => acc + Number(cur.balance ?? 0), 0) || invoice.transfers?.reduce((acc: any, cur: any) => acc + Number(cur.balance ?? 0), 0)
        return amount

    }, [JSON.stringify(invoice.tickets), JSON.stringify(invoice.transfers)])

    const creditNotes = useMemo(() => {
        if (!invoice.credit_notes.length) return []
        const statuses = ["Timbrado", "Cancelado", "Pendiente de cancelación", "Cancelación rechazada"]
        return invoice.credit_notes.filter(cn => statuses.includes(cn.status))

    }, [JSON.stringify(invoice.credit_notes)])
    const paymentComplements = useMemo(() => {
        if (invoice.payment_complement) return [{ ...invoice.payment_complement, amount: Number(invoice.amount) }]
        if (!invoice.tickets.length) return []
        const statuses = ["Timbrado", "Cancelado", "Pendiente de cancelación", "Cancelación rechazada"]
        const paymentComplements: Complement[] = []
        invoice.tickets.forEach(ticket => {
            if (!!ticket.customer_deposits) {
                ticket.customer_deposits.forEach(deposit => {
                    if (!!deposit.payment_complement && statuses.includes(deposit.payment_complement.status)) {
                        paymentComplements.push({
                            ...deposit.payment_complement,
                            amount: Number(deposit.amount)
                        })
                    }
                })
            }
        })
        return paymentComplements

    }, [JSON.stringify(invoice.tickets)])

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
                    <Modal.Container size="lg">
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading>Documentos asociados  ·
                                    <span className="font-semibold ml-1">
                                        {invoice.serie}-{invoice.folio}
                                    </span>
                                </Modal.Heading>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="p-4 bg-datia-gray/10 rounded-2xl grid grid-cols-3 gap-3 items-start min-w-sm overflow-x-auto">
                                    <div className="grid col-span-2">
                                        <p className="font-semibold text-lg mb-1 text-black/80">Factura {invoice.serie} - {invoice.folio}</p>
                                        <p className="text-sm">Emisor</p>
                                        <p className="font-semibold mb-2">{xml?.Emisor?.Nombre ?? "No disponible"}</p>
                                        <p className="text-sm">Método de pago</p>
                                        <p className="font-semibold">{xml?.MetodoPago ?? "No disponible"}</p>
                                    </div>
                                    <div className="grid">
                                        <p className="text-right text-sm">Fecha de emisión</p>
                                        <p className="text-right font-semibold mb-2">{invoice.invoice_certification_date}</p>
                                        <p className="text-right text-sm">Lugar de expedición</p>
                                        <p className="text-right font-semibold ">{xml?.LugarExpedicion ?? "No disponible"}</p>
                                    </div>
                                    <div className="col-span-3 grid gap-3 grid-cols-2">
                                        <div className="col-span-2">
                                            <Divider />
                                        </div>
                                        <div className="grid">
                                            <p className="text-sm">Importe</p>
                                            <p className="font-semibold text-base">{xml?.Total ? "$" + Number(xml.Total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "No disponible"}</p>
                                        </div>
                                        <div className="grid text-right">
                                            <p className="text-sm">Saldo</p>
                                            <p className="font-semibold text-base">{xml?.Total ? "$" + balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "No disponible"}</p>
                                        </div>
                                    </div>
                                </div>
                                {
                                    invoice.tickets.length > 0 && (
                                        <div className="grid mt-4">
                                            <p className=" mb-3 font-semibold text-base text-black/80">Ticket(s) de la factura:</p>
                                            <div className="grid grid-cols-5 gap-x-3 min-w-sm">
                                                <p>Folio</p>
                                                <p>Fecha</p>
                                                <p className="text-right">Importe</p>
                                                <p className="text-right">Saldo</p>
                                                <p></p>
                                                <div className="col-span-5 my-1">
                                                    <Divider className="h-px!" />
                                                </div>
                                                {
                                                    invoice.tickets.map((ticket) => {

                                                        return (
                                                            <div key={ticket.uuid} className=" py-0.5 col-span-5 grid grid-cols-5 text-[0.8rem] items-center min-w-sm overflow-x-auto">
                                                                <div className="font-semibold">{ticket.folio}</div>
                                                                <div className="">{ticket.created_at.split("T")[0]}</div>
                                                                <div className="text-right">${Number(ticket.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                                <div className="text-right">${Number(ticket.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                                <div className="flex justify-end">
                                                                    <Tooltip delay={300}>
                                                                        <Tooltip.Trigger>
                                                                            <Button onPress={() => handlePrintPDF(ticket.uuid)} variant="tertiary" size="sm" className={"scale-90"} isIconOnly>
                                                                                <FaPrint />
                                                                            </Button>
                                                                        </Tooltip.Trigger>
                                                                        <Tooltip.Content>
                                                                            <p>Imprimir ticket</p>
                                                                        </Tooltip.Content>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    creditNotes.length > 0 && (
                                        <div className="grid mt-4">
                                            <p className=" mb-3 font-semibold text-base text-black/80">Nota(s) de crédito de la factura:</p>
                                            <div className="grid grid-cols-5 gap-x-3 min-w-sm">
                                                <p>Folio</p>
                                                <p>Fecha</p>
                                                <p>Estatus</p>
                                                <p className="text-right">Importe</p>
                                                <p></p>
                                                <div className="col-span-5 my-1">
                                                    <Divider className="h-px!" />
                                                </div>
                                                {
                                                    creditNotes.map((credit_note) => {

                                                        return (
                                                            <div key={credit_note.uuid} className=" py-0.5 col-span-5 grid grid-cols-5 text-[0.8rem] items-center min-w-sm">
                                                                <div className="font-semibold">{credit_note.folio}</div>
                                                                <div>{credit_note.credit_note_certification_date}</div>
                                                                <div>{credit_note.status}</div>
                                                                <div className="text-right">${Number(credit_note.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                                <div className="flex justify-end scale-90 -mr-1.5">
                                                                    <Tooltip delay={300}>
                                                                        <Tooltip.Trigger>
                                                                            <Button onPress={() => handleDownloadPDF(credit_note.uuid, "creditNote")} variant="primary" size="sm" className={"rounded-r-none"} isIconOnly>
                                                                                <FaFilePdf />
                                                                            </Button>
                                                                        </Tooltip.Trigger>
                                                                        <Tooltip.Content>
                                                                            <p>Imprimir pdf</p>
                                                                        </Tooltip.Content>
                                                                    </Tooltip>
                                                                    <Tooltip delay={300}>
                                                                        <Tooltip.Trigger>
                                                                            <Button onPress={() => handleDownloadXML(credit_note.xml, "NOTA_DE_CREDITO")} variant="secondary" size="sm" className={"rounded-l-none"} isIconOnly>
                                                                                <LuCodeXml />
                                                                            </Button>
                                                                        </Tooltip.Trigger>
                                                                        <Tooltip.Content>
                                                                            <p>Imprimir xml</p>
                                                                        </Tooltip.Content>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    paymentComplements.length > 0 && (
                                        <div className="grid mt-4">
                                            <p className=" mb-3 font-semibold text-base text-black/80">Complemento(s) de pago de la factura:</p>
                                            <div className="grid grid-cols-5 gap-x-3 min-w-sm">
                                                <p>Folio</p>
                                                <p>Fecha</p>
                                                <p>Estatus</p>
                                                <p className="text-right">Importe</p>
                                                <p></p>
                                                <div className="col-span-5 my-1">
                                                    <Divider className="h-px!" />
                                                </div>
                                                {
                                                    paymentComplements.map((complement) => {

                                                        return (
                                                            <div key={complement.uuid} className=" py-0.5 col-span-5 grid grid-cols-5 text-[0.8rem] items-center min-w-sm">
                                                                <div className="font-semibold">{complement.folio}</div>
                                                                <div>{complement.complement_certification_date}</div>
                                                                <div>{complement.status}</div>
                                                                <div className="text-right">${complement.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                                <div className="flex justify-end scale-90 -mr-1.5">
                                                                    <Tooltip delay={300}>
                                                                        <Tooltip.Trigger>
                                                                            <Button onPress={() => handleDownloadPDF(complement.uuid, "paymentComplement")} variant="primary" size="sm" className={"rounded-r-none"} isIconOnly>
                                                                                <FaFilePdf />
                                                                            </Button>
                                                                        </Tooltip.Trigger>
                                                                        <Tooltip.Content>
                                                                            <p>Imprimir pdf</p>
                                                                        </Tooltip.Content>
                                                                    </Tooltip>
                                                                    <Tooltip delay={300}>
                                                                        <Tooltip.Trigger>
                                                                            <Button onPress={() => handleDownloadXML(complement.xml, "COMPLEMENTO_DE_PAGO")} variant="secondary" size="sm" className={"rounded-l-none"} isIconOnly>
                                                                                <LuCodeXml />
                                                                            </Button>
                                                                        </Tooltip.Trigger>
                                                                        <Tooltip.Content>
                                                                            <p>Imprimir xml</p>
                                                                        </Tooltip.Content>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </Modal.Body>
                            <Modal.Footer />
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    )
}