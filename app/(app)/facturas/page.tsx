"use client"
import Divider from "@/components/misc/Divider"
import QueryInput from "@/components/misc/QueryInput"
import DataTable, { DataTableColumn } from "@/components/table/DataTable"
import { axios } from "@/lib/axios"
import { DateField, DateRangePicker, Label, RangeCalendar, Select, ListBox, Chip, Button, Tooltip } from "@heroui/react"
import { DateValue, getLocalTimeZone, today } from "@internationalized/date"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { FaFileInvoice } from "react-icons/fa"
import { FaFilePdf } from "react-icons/fa6";
import { LuCodeXml } from "react-icons/lu"
import { toast } from "sonner"
import useSWR from "swr"
import InvoiceInfoModal from "./invoiceInfoModal"

const fetcher = ([url, page, query]: [string, string, string]) => axios.get(url, { params: { page, query } }).then(res => res.data)

type DateRange = {
    start: DateValue;
    end: DateValue;
};


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

    credit_notes: unknown[];
    tickets: InvoiceTicket[];

    payment_complement: any; //TODO
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

    payment_complement: unknown | null;
}

const start = today(getLocalTimeZone());

const columns: DataTableColumn<Invoice>[] = [
    {
        label: "Folio",
        key: "folio",
        isRowHeader: true,
        render: (invoice) => <p className=" text-nowrap">{invoice.serie} - {invoice.folio}</p>
    },
    {
        label: "Método de pago",
        key: "payment_method",
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
                return "$" + invoice.tickets.reduce((acc: any, cur: any) => acc + Number(cur.balance ?? 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumfractionDigits: 2 })
            }
            if (invoice.transfers.length > 0) {
                return "$" + invoice.transfers.reduce((acc: any, cur: any) => acc + Number(cur.balance ?? 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumfractionDigits: 2 })
            }
        },
    },
    {
        label: "Estatus",
        key: "status",
        render: ({ status }) => {
            switch (status) {
                case "Timbrado":
                    return <Chip size="lg" className="bg-green-700/80 text-white">{status}</Chip>
                case "Cancelado":
                    return <Chip size="lg" className="bg-red-700/80 text-white">{status}</Chip>
                default:
                    return <Chip size="lg" className="bg-datia-gray">{status}</Chip>
            }
        }
    },
    {
        label: "Fecha de certificación",
        key: "invoice_certification_date",
        render: (invoice) =>
            invoice.invoice_certification_date
                ? new Date(
                    invoice.invoice_certification_date,
                ).toLocaleDateString("es-MX")
                : "-",
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
                    axios.get(`api/portal/invoices/${invoice.uuid}/pdf`, {
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
    const page = Number(searchParams.get("page")) || 1
    const query = searchParams.get("query") || ""

    const { data, isLoading, isValidating } = useSWR(['/api/portal/invoices', page, query], fetcher, { keepPreviousData: true })

    const [value, setValue] = useState<DateRange | null>({ end: start, start });


    const currentPage = data?.current_page ?? page
    const lastPage = data?.last_page ?? 1

    return (
        <div className="mt-2">
            <div className=" max-w-4xl mx-auto">
                <h1 className="font-semibold text-4xl text-datia-primary">Mis facturas</h1>
                <h2 className="text-datia-gray my-3">
                    Listado de facturas y descarga de PDF, XML, y documentos asociados
                </h2>
            </div>
            <Divider />
            <div className="flex flex-col gap-4 mt-3 max-w-4xl mx-auto">
                <div className="flex gap-3 items-end flex-wrap sm:flex-nowrap">
                    <QueryInput placeholder="Buscar por folio..." />
                    <Select className="w-full sm:w-fit sm:min-w-44" placeholder="Todos los estatus">
                        <Label>
                            Filtrar por estatus
                        </Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.ClearButton />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                <ListBox.Item>
                                    <Label>Timbradas</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item>
                                    <Label>Canceladas</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            </ListBox>
                        </Select.Popover>
                    </Select>
                    <DateRangePicker className="sm:ml-auto w-full sm:w-fit" endName="endDate" startName="startDate" value={value} onChange={setValue}>
                        <Label>Filtrar por fecha</Label>
                        <DateField.Group fullWidth>
                            <DateField.Input slot="start">
                                {(segment) => <DateField.Segment segment={segment} />}
                            </DateField.Input>
                            <DateRangePicker.RangeSeparator />
                            <DateField.Input slot="end">
                                {(segment) => <DateField.Segment segment={segment} />}
                            </DateField.Input>
                            <DateField.Suffix>
                                <DateRangePicker.Trigger>
                                    <DateRangePicker.TriggerIndicator />
                                </DateRangePicker.Trigger>
                            </DateField.Suffix>
                        </DateField.Group>
                        <DateRangePicker.Popover>
                            <RangeCalendar aria-label="Filtro-fecha">
                                <RangeCalendar.Header>
                                    <RangeCalendar.YearPickerTrigger>
                                        <RangeCalendar.YearPickerTriggerHeading />
                                        <RangeCalendar.YearPickerTriggerIndicator />
                                    </RangeCalendar.YearPickerTrigger>
                                    <RangeCalendar.NavButton slot="previous" />
                                    <RangeCalendar.NavButton slot="next" />
                                </RangeCalendar.Header>
                                <RangeCalendar.Grid>
                                    <RangeCalendar.GridHeader>
                                        {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                                    </RangeCalendar.GridHeader>
                                    <RangeCalendar.GridBody>
                                        {(date) => <RangeCalendar.Cell date={date} />}
                                    </RangeCalendar.GridBody>
                                </RangeCalendar.Grid>
                                <RangeCalendar.YearPickerGrid>
                                    <RangeCalendar.YearPickerGridBody>
                                        {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
                                    </RangeCalendar.YearPickerGridBody>
                                </RangeCalendar.YearPickerGrid>
                            </RangeCalendar>
                        </DateRangePicker.Popover>
                    </DateRangePicker>
                </div>
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