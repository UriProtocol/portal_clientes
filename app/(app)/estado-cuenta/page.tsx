"use client"
import DateRangeFilter from "@/components/misc/DateRangeFilter";
import Divider from "@/components/misc/Divider";
import QueryInput from "@/components/misc/QueryInput";
import DataTable, { DataTableColumn } from "@/components/table/DataTable";
import { useAuth } from "@/hooks/auth/auth";
import { axios } from "@/lib/axios";
import { Button, Tooltip } from "@heroui/react";
import clsx from "clsx";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import { LuCodeXml } from "react-icons/lu";
import { motion } from 'framer-motion'
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaFileInvoice } from "react-icons/fa";
import useSWR from "swr";
import { toast } from "sonner";
import DocumentInfoModal, { formatCurrency, formatDate, getDocumentStatus } from "./documentInfoModal";

const PER_PAGE = 10

type MovementType = "charge" | "deposit" | "credit_note" | "return"

export interface StatementMovement {
    type: MovementType
    uuid?: string
    id: string | number
    id_origin: string | number
    amount: string | number
    balance?: string | number
    date: string
    due_date?: string | null
    branch: string
    invoice: string
}

export interface StatementDocument {
    id: string
    branch: string
    invoice: string
    date: string
    dueDate: string | null
    charges: number
    payments: number
    balance: number
    movements: StatementMovement[]
}

interface StatementResponse {
    data: {
        date_start: string
        date_end: string
        records: Record<string, StatementMovement[]> | StatementMovement[][]
    }
    pagination: {
        current_page: number
        per_page: number
        total: number
        last_page: number
    }
}

// El endpoint espera las fechas como { year, month, day }
function toDateParts(value: string) {
    const [year, month, day] = value.split("-").map(Number)
    return { year, month, day }
}

function todayISO() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

// Agrupa los movimientos de cada documento (cargo, abonos, notas de crédito y devoluciones) en una sola fila
function toDocuments(records: StatementResponse["data"]["records"] | undefined): StatementDocument[] {
    if (!records) return []

    return Object.values(records)
        .filter(movements => movements.length > 0)
        .map(movements => {
            const charge = movements.find(m => m.type === "charge")
            const charges = movements
                .filter(m => m.type === "charge")
                .reduce((acc, m) => acc + Number(m.amount ?? 0), 0)
            const payments = movements
                .filter(m => m.type !== "charge")
                .reduce((acc, m) => acc + Number(m.amount ?? 0), 0)
            const first = charge ?? movements[0]

            return {
                id: String(first.id),
                branch: first.branch,
                invoice: charge?.invoice ?? "No tiene",
                date: first.date,
                dueDate: charge?.due_date ?? null,
                charges,
                payments,
                balance: charge?.balance !== undefined ? Number(charge.balance) : charges - payments,
                movements,
            }
        })
}

interface ChargesSummary {
    balance: number
    documents: number
}

interface DepositsSummary {
    amount: number
    deposits: number
}

const summaryFetcher = <T,>(url: string) => axios.get<T>(url).then(res => res.data)

const fetcher = ([url, uuid, page, query, startDate, endDate, sortBy, sortDirection]: [string, string, number, string, string, string, string, string]) =>
    axios.post<StatementResponse>(url, {
        params: {
            uuid,
            date_start: toDateParts(startDate),
            date_end: toDateParts(endDate),
            status: "Ambos",
            information: true,
            wants_pdf: false,
            page,
            per_page: PER_PAGE,
            query,
            sortBy,
            sortDirection,
        },
    }).then(res => res.data)

const columns: DataTableColumn<StatementDocument>[] = [
    {
        label: "Folio",
        key: "id",
        isRowHeader: true,
        sortable: true,
        render: (doc) => <p className="text-nowrap font-semibold">{doc.branch}-{doc.id}</p>,
    },
    {
        label: "Factura",
        key: "invoice",
        sortable: true,
        render: (doc) => <p className="text-nowrap">{doc.invoice}</p>,
    },
    {
        label: "Fecha",
        key: "date",
        sortable: true,
        render: (doc) => formatDate(doc.date),
    },
    {
        label: "Vencimiento",
        key: "dueDate",
        render: (doc) => formatDate(doc.dueDate),
    },
    {
        label: "Estatus",
        key: "status",
        render: (doc) => <p>{getDocumentStatus(doc)}</p>,
    },
    {
        label: "Cargos",
        key: "charges",
        sortable: true,
        render: (doc) => formatCurrency(doc.charges),
    },
    {
        label: "Abonos",
        key: "payments",
        render: (doc) => <p className="text-green-800">{formatCurrency(doc.payments)}</p>,
    },
    {
        label: "Saldo",
        key: "balance",
        sortable: true,
        render: (doc) => (
            <p className={clsx("font-semibold", doc.balance > 0 ? "text-red-800" : "text-green-800")}>
                {formatCurrency(doc.balance)}
            </p>
        ),
    },
    {
        label: "Acciones",
        key: "actions",
        render: (doc) => <DocumentInfoModal document={doc} />,
    },
]

export default function EstadoDeCuenta() {

    const { user } = useAuth()

    const searchParams = useSearchParams()
    const page = Number(searchParams.get("page")) || 1
    const query = searchParams.get("query") || ""
    // Sin fechas en la URL se consulta desde el inicio del año hasta hoy
    const endDate = searchParams.get("endDate") || todayISO()
    const startDate = searchParams.get("startDate") || `${endDate.slice(0, 4)}-01-01`
    const sortBy = searchParams.get("sortBy") || "date"
    const sortDirection = searchParams.get("sortDirection") || "desc"
    const customerUuid = user?.customer?.uuid

    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

    const { data, isLoading, isValidating } = useSWR(
        customerUuid ? ["/statementAccount/download", customerUuid, page, query, startDate, endDate, sortBy, sortDirection] : null,
        fetcher,
        { keepPreviousData: true },
    )

    const { data: chargesSummary } = useSWR(
        customerUuid ? "/statementAccount/summary" : null,
        summaryFetcher<ChargesSummary>,
    )
    const { data: depositsSummary } = useSWR(
        customerUuid ? "/statementAccount/deposits" : null,
        summaryFetcher<DepositsSummary>,
    )

    const documents = useMemo(() => toDocuments(data?.data?.records), [data])
    const pagination = data?.pagination
    const currentPage = pagination?.current_page ?? page
    const from = pagination && pagination.total > 0 ? (currentPage - 1) * pagination.per_page + 1 : 0
    const to = pagination ? Math.min(currentPage * pagination.per_page, pagination.total) : 0

    const handleToggleStatus = useCallback((status: string) => {
        setSelectedStatuses(prev => {
            const prevCopy = [...prev]
            if (prevCopy.includes(status)) {
                return prevCopy.filter(s => s != status)
            }
            return [...prevCopy, status]
        })
    }, [])

    const handleDownloadStatementAccount = useCallback(async (wants_pdf: boolean) => {
        toast.promise(
            axios.post(
                "/statementAccount/download",
                {
                    params: {
                        uuid: customerUuid,
                        date_start: toDateParts(startDate),
                        date_end: toDateParts(endDate),
                        status: "Ambos",
                        wants_pdf,
                    },
                },
                {
                    responseType: "blob",
                }
            ),
            {
                loading: "Imprimiendo",
                success: (response) => {

                    if (wants_pdf) {
                        const blob = new Blob([response.data], { type: "application/pdf" });
                        const url = window.URL.createObjectURL(blob);

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
                            alert(
                                "Tu navegador bloqueó la ventana emergente. Permite ventanas emergentes para ver el PDF."
                            );
                            console.error("No se pudo abrir la nueva ventana.");
                        }
                    } else {
                        const url = window.URL.createObjectURL(
                            new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
                        );
                        console.log("URL de descarga:", url);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `Estado_de_cuenta.xlsx`);
                        document.body.appendChild(link);

                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url)
                        return 'Archivo Excel generado correctamente'

                    }


                    return `Estado de cuenta generado correctamente.`;
                },
                error: (error) => {
                    return `Error: ${error.response?.data?.message}`;
                },
                duration: 3000,
            }
        );
    }, [endDate, startDate, customerUuid]);

    const selectedStatusObj = useMemo(() => {
        return {
            vencido: selectedStatuses.includes("vencido"),
            atencion: selectedStatuses.includes("atencion"),
            critico: selectedStatuses.includes("critico"),
        }
    }, [JSON.stringify(selectedStatuses)])

    return (
        <div className="mt-2">
            <div className=" max-w-4xl mx-auto grid grid-cols-3 mb-2">
                <div className="grid col-span-2">
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
                        Estado de cuenta
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
                        Documentos, cargos, y abonos del cliente:
                        <span className="ml-1 capitalize">
                            {user?.customer?.name?.toLowerCase()}
                        </span>
                    </motion.h2>
                </div>
                <div className="grid items-end gap-2 mb-3">
                    <motion.div
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        transition={{
                            delay: 0.3
                        }}
                        className="flex justify-end text-right w-full"
                    >
                        <Tooltip delay={200}>
                            <Tooltip.Trigger>
                                <Button onPress={() => handleDownloadStatementAccount(true)} size="lg" isIconOnly className={"rounded-r-none px-8"}><FaFilePdf /></Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                Descargar estado de cuenta en PDF
                            </Tooltip.Content>
                        </Tooltip>
                        <Tooltip delay={200}>
                            <Tooltip.Trigger>
                                <Button onPress={() => handleDownloadStatementAccount(false)} size="lg" isIconOnly className={"rounded-l-none px-8"} variant="secondary"><FaFileExcel className="scale-110" /></Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                Descargar estado de cuenta en Excel
                            </Tooltip.Content>
                        </Tooltip>
                    </motion.div>
                </div>
            </div>
            <Divider />
            <div className="max-w-5xl mx-auto my-4 grid">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 items-start">
                    <motion.div
                        className="grid gap-2 text-center"
                        initial={{
                            y: -10,
                            opacity: 0
                        }}
                        animate={{
                            y: 0,
                            opacity: 1
                        }}
                        transition={{
                            delay: 0.4
                        }}
                    >
                        <h3 className=" text-datia-gray font-semibold">Crédito Disponible</h3>
                        <p className={clsx("font-semibold text-4xl", Number(user?.customer?.credit_limit) > 0 ? "text-datia-primary" : "text-red-700")}>
                            ${(Number(user?.customer?.credit_limit ?? 0) - Number(user?.customer?.current_balance ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-datia-gray text-sm">
                            Límite ${Number(user?.customer?.credit_limit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </motion.div>
                    <motion.div
                        className="grid gap-2 text-center"
                        initial={{
                            y: -10,
                            opacity: 0
                        }}
                        animate={{
                            y: 0,
                            opacity: 1
                        }}
                        transition={{
                            delay: 0.5
                        }}
                    >
                        <h3 className=" text-datia-gray font-semibold ml-4">Pendiente de Pago</h3>
                        <p className={clsx("font-semibold text-4xl text-datia-gray")}>
                            ${Number(user?.customer?.current_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </motion.div>
                    <motion.div
                        className="grid gap-2 text-center"
                        initial={{
                            y: -10,
                            opacity: 0
                        }}
                        animate={{
                            y: 0,
                            opacity: 1
                        }}
                        transition={{
                            delay: 0.6
                        }}
                    >
                        <h3 className=" text-datia-gray font-semibold">Cartera Vencida</h3>
                        <p className="text-red-800 font-semibold text-4xl">
                            ${Number(chargesSummary?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-datia-gray text-sm">
                            {chargesSummary?.documents ?? 0} {chargesSummary?.documents === 1 ? "documento" : "documentos"}
                        </p>
                    </motion.div>
                    <motion.div
                        className="grid gap-2 text-center"
                        initial={{
                            y: -10,
                            opacity: 0
                        }}
                        animate={{
                            y: 0,
                            opacity: 1
                        }}
                        transition={{
                            delay: 0.7
                        }}
                    >
                        <h3 className=" text-datia-gray font-semibold ml-4">Pagos Registrados</h3>
                        <p className="text-green-800 font-semibold text-4xl">
                            ${Number(depositsSummary?.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-datia-gray text-sm">
                            {depositsSummary?.deposits ?? 0} {depositsSummary?.deposits === 1 ? "depósito" : "depósitos"}
                        </p>
                    </motion.div>
                </div>
            </div>
            <Divider className=" mt-4" />
            <motion.div
                initial={{
                    y: -10,
                    opacity: 0
                }}
                animate={{
                    y: 0,
                    opacity: 1
                }}
                transition={{
                    delay: 0.8
                }}
                className="flex flex-wrap md:flex-nowrap gap-3 items-end mt-4 mx-auto max-w-5xl"
            >
                <QueryInput placeholder="Buscar por folio" />
                <DateRangeFilter variant="split" />
                <div className="grid gap-1">
                    <p className=" text-sm">Estatus</p>
                    <div className="flex gap-1.5">
                        <Button
                            className={clsx(
                                "bg-datia-gray/40 text-black border border-datia-gray transition-all",
                                selectedStatusObj.vencido && " bg-datia-gray! text-white!"
                            )}
                            onPress={() => handleToggleStatus("vencido")}
                        >
                            Vencido
                        </Button>
                        <Button
                            className={clsx(
                                "bg-datia-secondary/40 text-yellow-950 border border-datia-secondary transition-all",
                                selectedStatusObj.atencion && "bg-datia-secondary! text-white!"
                            )}
                            onPress={() => handleToggleStatus("atencion")}
                        >
                            Atención
                        </Button>
                        <Button
                            className={clsx(
                                "bg-red-800/40 text-red-950 border border-red-800 transition-all",
                                selectedStatusObj.critico && "bg-red-800! text-white!"
                            )}
                            onPress={() => handleToggleStatus("critico")}
                        >
                            Crítico
                        </Button>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{
                    y: -10,
                    opacity: 0
                }}
                animate={{
                    y: 0,
                    opacity: 1
                }}
                transition={{
                    delay: 1
                }}
                className="mt-4 mx-auto max-w-5xl"
            >
                <DataTable
                    columns={columns}
                    items={documents}
                    getRowId={(doc) => doc.id}
                    isLoading={isLoading || !customerUuid}
                    isValidating={isValidating}
                    skeletonRows={6}
                    ariaLabel="Movimientos del estado de cuenta"
                    emptyState={
                        <>
                            <FaFileInvoice className="mt-4 text-4xl text-datia-primary opacity-60" />
                            <span className="text-datia-primary opacity-60">
                                No se encontraron movimientos en el periodo
                            </span>
                        </>
                    }
                    pagination={{
                        currentPage,
                        lastPage: pagination?.last_page ?? 1,
                        from,
                        to,
                        total: pagination?.total,
                    }}
                />
            </motion.div>
        </div>
    )
}