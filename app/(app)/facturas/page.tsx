"use client"
import DateRangeFilter from "@/components/misc/DateRangeFilter"
import Divider from "@/components/misc/Divider"
import QueryInput from "@/components/misc/QueryInput"
import DataTable, { DataTableColumn } from "@/components/table/DataTable"
import { axios } from "@/lib/axios"
import { Label, Select, ListBox, Chip, Button, Tooltip } from "@heroui/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Key } from "react-aria-components"
import { useCallback } from "react"
import { FaFileInvoice } from "react-icons/fa"
import { FaFilePdf } from "react-icons/fa6";
import { LuCodeXml } from "react-icons/lu"
import { toast } from "sonner"
import useSWR from "swr"
import InvoiceInfoModal from "./invoiceInfoModal"
import clsx from "clsx"
import { motion } from 'framer-motion'

const fetcher = ([url, page, query, sortBy, sortDirection, startDate, endDate, status]: [string, string, string, string, string, string, string, string]) => axios.get(url, { params: { page, query, sortBy, sortDirection, startDate, endDate, status } }).then(res => res.data)

export interface Invoice {
    id: number;
    uuid: string;
    serie: string;
    folio: string;
    type: string;

    payment_method: string;
    payment_type: string;
    uso_cfdi: string;
    amount: string;
    status: string;

    customer_envoice_information: InvoiceCustomerInformation;
    customer_uuid: string;
    branch_uuid: string;
    destination_location_uuid: string | null;
    payment_complement_uuid: string | null;

    xml: string;
    timbre: InvoiceTimbre | null;
    invoice_certification_date: string | null;
    is_validated: number;
    comment: string | null;
    deleted_at: string | null;

    created_at: string;
    updated_at: string;

    credit_notes: CreditNote[];
    tickets: InvoiceTicket[];

    payment_complement: PaymentComplement | null; //TODO
    transfers: any[]; //TODO
}

export interface InvoiceCustomerInformation {
    rfc: string;
    name: string;
    email: string | null;
    code_zip: string;
    tax_regime: string;
}

export interface InvoiceTimbre {
    UUID: string;
    Estado: string;
    SelloCFD: string;
    SelloSAT: string;
    FechaTimbrado: string;
    NumeroCertificadoSAT: string;
}

export interface InvoiceTicket {
    id: number;
    uuid: string;
    folio: string;
    number_customer: number;

    amount: string;
    iva: string;
    sub_total: string;
    status: string;
    change: string;

    type_sale: string;
    status_credit: string;
    balance: string;

    status_history_uuid: string;
    user_uuid: string;
    customer_uuid: string;
    branch_uuid: string;
    remission_uuid: string;
    cash_count_uuid: string;
    agent_uuid: string;

    ticket_cash_advance_uuid: string | null;

    deleted_at: string | null;
    created_at: string;
    updated_at: string;

    laravel_through_key: string;

    customer_deposits: InvoiceCustomerDeposit[];
}

export interface InvoiceCustomerDeposit {
    id: number;
    uuid: string;
    reference: number;
    amount: string;
    concept: string;
    payment_method: string;

    terminal_uuid: string | null;
    status: string;
    branch_uuid: string;
    customer_uuid: string;
    user_uuid: string;
    cash_count_uuid: string;

    ticket_uuid: string | null;
    invoice_uuid: string | null;
    credit_balance_uuid: string | null;

    deleted_at: string | null;
    created_at: string;
    updated_at: string;

    payment_complement: PaymentComplement | null;
}

export interface CreditNote {
    uuid: string,
    folio: string,
    credit_note_certification_date: string,
    amount: string
    xml: string
    status: string
}
export interface PaymentComplement {
    uuid: string,
    folio: string,
    complement_certification_date: string,
    xml: string
    status: string
}

const columns: DataTableColumn<Invoice>[] = [
    {
        label: "Folio",
        key: "folio",
        isRowHeader: true,
        sortable: true,
        render: (invoice) => <p className=" text-nowrap">{invoice.serie} - {invoice.folio}</p>
    },
    {
        label: "Método de pago",
        key: "payment_method",
        sortable: true,
        render: (invoice) => (
            <div className="flex justify-center">
                <Tooltip delay={400}>
                    <Tooltip.Trigger>
                        <p>{invoice.payment_method.substring(0, 3)}</p>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        {invoice.payment_method}
                    </Tooltip.Content>
                </Tooltip>
            </div>
        )

    },
    {
        label: "Total",
        key: "amount",
        render: (invoice) =>
            new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
            }).format(Number(invoice.amount)),
    },
    {
        label: "Saldo",
        key: "balance",
        render: (invoice) => {
            if (invoice.payment_method?.startsWith('PUE')) return '$0.00'
            if (invoice.tickets.length > 0) {
                const amount = invoice.tickets.reduce((acc: any, cur: any) => acc + Number(cur.balance ?? 0), 0)
                return <p className={clsx(amount > 0 ? "text-red-800" : "text-green-800")}>${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumfractionDigits: 2 })}</p>
            }
            if (invoice.transfers.length > 0) {
                const amount = invoice.transfers.reduce((acc: any, cur: any) => acc + Number(cur.balance ?? 0), 0)
                return <p className={clsx(amount > 0 ? "text-red-800" : "text-green-800")}>${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumfractionDigits: 2 })}</p>
            }
        },
    },
    {
        label: "Estatus",
        key: "status",
        sortable: true,
        render: ({ status }) => {
            switch (status) {
                case "Timbrado":
                    return <Chip size="lg" className="bg-green-700/80 text-white">{status}</Chip>
                case "Cancelado":
                    return <Chip size="lg" className="bg-red-700/80 text-white">{status}</Chip>
                case "Pendiente de cancelación":
                    return <Chip size="lg" className="bg-red-700/80 text-white">{status}</Chip>
                default:
                    return <Chip size="lg" className="bg-datia-gray">{status}</Chip>
            }
        }
    },
    {
        label: "Fecha de certificación",
        key: "invoice_certification_date",
        sortable: true,
    },
    {
        label: "Acciones",
        key: "actions",
        render: (invoice) => {

            const handleDownloadXML = () => {
                const xml = invoice.xml
                if (!xml) return
                const blob = new Blob([xml], { type: "text/xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `FACTURA_${invoice.serie}_${invoice.folio}.xml`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            const handleDownloadPDF = async () => {
                toast.promise(
                    axios.get(`/invoices/${invoice.uuid}/pdf`, {
                        responseType: "blob",
                    }),
                    {
                        loading: "Generando PDF...",
                        success: (response) => {
                            const url = window.URL.createObjectURL(
                                new Blob([response.data], { type: "application/pdf" })
                            );

                            const newWindow = window.open(
                                url,
                                "PrintWindow",
                                "toolbar=no,scrollbars=no,resizable=no,top=100,left=100,width=800,height=600"
                            );
                            if (newWindow) {
                                newWindow.onload = () => {
                                    newWindow.focus();
                                };
                            } else {
                                alert(
                                    "Tu navegador bloqueó la ventana emergente. Permite ventanas emergentes para ver el PDF."
                                );
                                console.error("No se pudo abrir la nueva ventana.");
                            }
                            return `Factura generada correctamente`;
                        },
                        error: (error) => {
                            return `Error: ${error.response?.data?.message}`;
                        },
                        duration: 3000,
                    }
                );
            };

            return (
                <div className="flex">
                    <Tooltip delay={200}>
                        <Tooltip.Trigger>
                            <Button isIconOnly className={"rounded-r-none"} onPress={handleDownloadPDF}><FaFilePdf /></Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            Descargar archivo PDF
                        </Tooltip.Content>
                    </Tooltip>
                    <Tooltip delay={200}>
                        <Tooltip.Trigger>
                            <Button isIconOnly className={"rounded-l-none"} variant="secondary" onPress={handleDownloadXML}><LuCodeXml className="scale-110" /></Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            Descargar archivo XML
                        </Tooltip.Content>
                    </Tooltip>
                    <InvoiceInfoModal invoice={invoice} />
                </div>
            )
        }
    }
]

export default function Facturas() {

    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const page = Number(searchParams.get("page")) || 1
    const query = searchParams.get("query") || ""
    const sortBy = searchParams.get("sortBy") || "id"
    const sortDirection = searchParams.get("sortDirection") || "desc"
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const status = searchParams.get("status")

    const handleStatusChange = useCallback((key: Key | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (key) params.set("status", String(key))
        else params.delete("status")
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [pathname, router, searchParams])

    const { data, isLoading, isValidating } = useSWR(['/invoices', page, query, sortBy, sortDirection, startDate, endDate, status], fetcher, { keepPreviousData: true })

    const currentPage = data?.current_page ?? page
    const lastPage = data?.last_page ?? 1

    return (
        <div className="mt-2">
            <div className=" max-w-5xl mx-auto">
                <motion.h1
                    initial={{
                        y: -10,
                        opacity: 0
                    }}
                    animate={{
                        y: 0,
                        opacity: 1
                    }}
                    className="font-semibold text-4xl"
                >
                    Mis facturas
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
                    className="text-datia-gray mt-3 mb-4"
                >
                    Listado de facturas y descarga de PDF, XML, y documentos asociados
                </motion.h2>
            </div>
            <Divider />
            <div className="flex flex-col gap-4 mt-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{
                        y: -10,
                        opacity: 0
                    }}
                    animate={{
                        y: 0,
                        opacity: 1
                    }}
                    className="flex gap-3 items-end flex-wrap sm:flex-nowrap"
                >
                    <QueryInput placeholder="Buscar por folio..." />
                    <Select
                        className="w-full sm:w-fit sm:min-w-44"
                        placeholder="Todos los estatus"
                        value={status}
                        onChange={handleStatusChange}
                        onClear={() => handleStatusChange(null)}
                    >
                        <Label>
                            Estatus
                        </Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.ClearButton />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                <ListBox.Item id="Timbrado">
                                    <Label>Timbradas</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="Cancelado">
                                    <Label>Canceladas</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            </ListBox>
                        </Select.Popover>
                    </Select>
                    <DateRangeFilter variant="split" className="sm:ml-auto w-full sm:w-fit" />
                </motion.div>
                    <DataTable
                        columns={columns}
                        items={data?.data ?? []}
                        getRowId={(invoice) => invoice.uuid}
                        isLoading={isLoading}
                        isValidating={isValidating}
                        skeletonRows={6}
                        ariaLabel="Listado de facturas"
                        emptyState={
                            <>
                                <FaFileInvoice className="mt-4 text-4xl text-datia-primary opacity-60" />
                                <span className="text-datia-primary opacity-60">
                                    No se encontraron facturas
                                </span>
                            </>
                        }
                        pagination={{
                            currentPage,
                            lastPage,
                            from: data?.from,
                            to: data?.to,
                            total: data?.total,
                        }}
                    />
            </div>
        </div>
    )
}