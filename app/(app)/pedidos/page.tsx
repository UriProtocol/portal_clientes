"use client"
import Divider from '@/components/misc/Divider'
import QueryInput from '@/components/misc/QueryInput'
import { Button, ButtonGroup, Card, Modal, Spinner, useOverlayState } from '@heroui/react'
import { motion } from 'framer-motion'
import BrandAutocomplete from './BrandAutocomplete'
import FamilySelect from './FamilySelect'
import SortSelect, { parseSort } from './SortSelect'
import { FaCartShopping, FaInfo, FaList, FaPlus } from 'react-icons/fa6'

type InventoryLocation = {
    location_uuid: string
    available_quantity: number | string | null
}

type Product = {
    uuid: string
    item_code: string
    item_name: string
    measure: string | null
    application: string | null
    sale_price: number | string | null
    brand: { uuid: string, name: string } | null
    family: { uuid: string, name: string } | null
    latest_factor_price: { price: number | string } | null
    inventory_locations?: InventoryLocation[]
    unit: string
}

type Paginated<T> = {
    data: T[]
    current_page: number
    last_page: number
    total: number
}

type ProductsKey = [string, string, string, string, string, string[], string, string, number]

const PER_PAGE = 20

// ProductsController@index lee los filtros directamente del request
const fetcher = ([url, query, measure, family, brand, calculatedMeasures, sortBy, order, page]: ProductsKey) =>
    axios.get<Paginated<Product>>(url, {
        params: {
            page,
            perPage: PER_PAGE,
            query: query || null,
            measure: measure || null,
            family: family || null,
            brand: brand || null,
            calculatedMeasures,
            sortBy: sortBy || null,
            order: order || null,
            with_existences: 1,
        },
    }).then(res => res.data)

const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" })

function getPrice(product: Product) {
    return Number(product.latest_factor_price?.price ?? 0)
}

function getExistence(product: Product) {
    return (product.inventory_locations ?? [])
        .reduce((total, il) => total + Number(il.available_quantity ?? 0), 0)
}

export default function Pedidos() {

    const [listType, setListType] = useState<"list" | "grid">("list")

    const searchParams = useSearchParams();
    const measure = searchParams.get("measure") ?? ""
    const query = searchParams.get("query") ?? ""
    const family = searchParams.get("family") ?? ""
    const brand = searchParams.get("brand") ?? ""
    const { sortBy, order } = parseSort(searchParams.get("sort"))

    const calculatedMeasures = useMemo(() => {
        return calculateMeasures(measure)
    }, [measure])

    // Un solo modal de ficha para toda la lista; se conserva el producto al cerrar para la animación de salida
    const detailState = useOverlayState()
    const [detailProduct, setDetailProduct] = useState<Product | null>(null)
    const openDetail = (product: Product) => {
        setDetailProduct(product)
        detailState.open()
    }

    const { data: pages, error, isLoading, isValidating, size, setSize } = useSWRInfinite(
        (index, previous: Paginated<Product> | null) => {
            if (previous && previous.current_page >= previous.last_page) return null
            return ["/products", query, measure, family, brand, calculatedMeasures, sortBy, order, index + 1] as ProductsKey
        },
        fetcher,
        { revalidateFirstPage: false },
    )
    const products = useMemo(() => pages?.flatMap(p => p.data) ?? [], [pages])
    const lastPage = pages?.[pages.length - 1]
    const total = pages?.[0]?.total ?? 0
    const hasMore = !!lastPage && lastPage.current_page < lastPage.last_page
    const isLoadingMore = isValidating && size > (pages?.length ?? 0)

    // Carga la siguiente página cuando el centinela entra en pantalla
    const sentinelRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasMore) return

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isValidating) setSize(size + 1)
        }, { rootMargin: "400px" })

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, isValidating, size, setSize])

    return (
        <>
            <div className=" max-w-6xl mx-auto flex justify-between">
                <div className='flex flex-col'>
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
                        Pedido en línea
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
                        Arma tu carrito y genera un pedido en línea
                    </motion.h2>
                </div>
                <Button
                    variant='tertiary'
                    className={"mt-auto mb-4 opacity-75"}
                >
                    <FaCartShopping />
                    Ver carrito
                </Button>
            </div>
            <Divider />
            <div className='max-w-6xl mx-auto py-6'>
                <div className='flex flex-col sm:grid sm:grid-cols-3 gap-3 '>
                    <MeasureInput />
                    <QueryInput placeholder='Busca por nombre o descripción' className='col-span-2' />
                </div>
                <div className='flex flex-col sm:grid gap-3 sm:grid-cols-2 mt-4 '>
                    <FamilySelect />
                    <div className='flex gap-3 items-end'>
                        <BrandAutocomplete className={"w-full"} />
                        <ButtonGroup>
                            <Button variant={"tertiary"} className={clsx(listType != "list" && "opacity-65")} onPress={() => setListType("list")}>
                                <FaList />
                            </Button>
                            <Button variant={"tertiary"} className={clsx(listType != "grid" && "opacity-65")} onPress={() => setListType("grid")}>
                                <BsGridFill />
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div className='flex flex-col gap-3 mt-3'>
                    <div className='flex justify-between items-end'>
                        <p className='text-datia-gray text-sm'>
                            {isLoading ? "Cargando productos..." : `${total} productos`} · Vista de {listType == "list" ? "lista" : "cuadrícula"}
                        </p>
                        <SortSelect className={"w-fit flex-row items-center gap-2"} />
                    </div>
                    <div
                        className={clsx(
                            "grid gap-3 w-full",
                            listType === "grid" && "grid-cols-2 lg:grid-cols-3 gap-5"
                        )}
                    >
                        {products.map(product => (
                            <ItemCard key={product.uuid} item={product} variant={listType} onOpenDetail={openDetail} />
                        ))}
                    </div>
                    {error && (
                        <p className='text-danger text-sm text-center py-4'>
                            No se pudieron cargar los productos.
                        </p>
                    )}
                    {!isLoading && !error && products.length === 0 && (
                        <p className='text-datia-gray text-sm text-center py-4'>
                            No se encontraron productos
                        </p>
                    )}
                    <div ref={sentinelRef} />
                    <ProductDetailModal product={detailProduct} state={detailState} />
                    {(isLoading || isLoadingMore) && (
                        <div className='flex justify-center py-4'>
                            <Spinner />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

import { InputGroup, TextField } from '@heroui/react'
import clsx from 'clsx';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react'
import { FaXmark } from 'react-icons/fa6';
import { useDebouncedCallback } from 'use-debounce';
import { TbRulerMeasure2 } from 'react-icons/tb'
import { BsGridFill } from 'react-icons/bs'
import ImagePreview from '@/components/misc/ImagePreview'
import calculateMeasures from '@/lib/calculateMeasures'
import { axios } from '@/lib/axios'
import useSWRInfinite from 'swr/infinite'
import { FaInfoCircle } from 'react-icons/fa'

function MeasureInput() {

    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [measure, setMeasure] = useState(searchParams.get("measure") ?? "")

    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("measure", term);
        } else {
            params.delete("measure");
        }
        params.set("page", "1");
        window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    }, 1000);

    const handleClear = () => {
        setMeasure("")
        const params = new URLSearchParams(searchParams);
        params.delete("measure");
        window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    };

    return (
        <motion.div
            layout
            className='w-full'
        >
            <TextField className="w-full" value={measure} onChange={e => {
                handleSearch(e)
                setMeasure(e)
            }}>
                <InputGroup>
                    <InputGroup.Prefix>
                        <TbRulerMeasure2 className=' text-datia-primary/50 scale-150' />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                        autoFocus
                        placeholder={"Buscar por medida"}
                        className="w-full"
                    />
                    <InputGroup.Suffix>
                        <Button
                            isIconOnly
                            className={clsx(
                                "bg-transparent text-datia-primary/50 -mr-3 transition-all",
                                !searchParams.get("query") && "opacity-0 pointer-events-none"
                            )}
                            onPress={handleClear}
                        >
                            <FaXmark />
                        </Button>
                    </InputGroup.Suffix>
                </InputGroup>
            </TextField>
        </motion.div>
    )
}

function ItemCard({ item, variant, onOpenDetail }: { item: Product, variant: "list" | "grid", onOpenDetail: (product: Product) => void }) {

    const existence = getExistence(item)
    const priceItem = getPrice(item)
    const description = [item.item_code, item.measure, item.family?.name?.toLowerCase(), item.brand?.name].filter(Boolean).join(" · ")

    const price = (
        <div className="flex gap-2 items-center">
            <Button size='sm'
                className={"bg-transparent text-datia-primary/90 text-xs px-1 py-0 transition-all hover:underline hover:text-datia-primary underline-offset-4"}
                onPress={() => onOpenDetail(item)}
            >
                <FaInfoCircle />
                Ver ficha
            </Button>
            <span className={clsx(
                "text-sm font-semibold text-green-800 mt-1",
                !priceItem && "text-yellow-800!"
            )}>
                {
                    priceItem ? currency.format(priceItem) : "No disponible"
                }
            </span>
            <p className='text-xs text-datia-gray mt-0.5'>Dist · Pza</p>
        </div>
    )

    const stock = existence > 0 ? (
        <p className={
            clsx(
                'absolute text-xs py-1 px-2 bg-datia-gray/10 rounded-lg',
                existence > 0 && existence <= 20 && "text-yellow-700 bg-yellow-700/10",
                existence > 20 && "text-green-700 bg-green-700/10",
                variant === "list" ? "-top-1 -right-1" : " top-0 left-0 bg-white! rounded-bl-none rounded-tr-none px-4 font-semibold text-[0.825rem]"
            )}>
            Disp. {existence}
        </p>
    ) : (
        <p className='absolute -top-1 -right-1 text-red-700 text-xs p-1 px-2 bg-red-700/10 rounded-lg shadow'>
            Sin existencia
        </p>
    )

    if (variant === "list") {

        return (
            <Card className="w-full gap-4 flex-row">
                <div className="relative h-24 shrink-0 overflow-hidden rounded-2xl cursor-pointer" onClick={() => onOpenDetail(item)}>
                    <ImagePreview className='size-24' />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                    <Card.Header className="gap-1 relative">
                        <Card.Title>
                            <Button size='sm'
                                className={"bg-transparent px-1 py-0.5 transition-all hover:underline hover:text-datia-primary underline-offset-4 text-foreground"}
                                onPress={() => onOpenDetail(item)}
                            >
                                {item.item_name}
                            </Button>
                        </Card.Title>
                        <Card.Description className=' capitalize text-[0.825rem] -mt-1.5'>{description}</Card.Description>
                        {stock}
                    </Card.Header>
                    <Card.Footer className="mt-auto flex w-ful gap-3 flex-row items-end justify-between">
                        {price}
                        <Button className="w-fit" isDisabled={existence <= 0 || !priceItem}>
                            <FaPlus />
                            Agregar al carrito
                        </Button>
                    </Card.Footer>
                </div>
            </Card>
        )
    }
    return (
        <Card className="w-full h-full gap-3 p-0 relative">
            {stock}
            {/* w-full! sobrescribe el w-fit del trigger de ImagePreview */}
            <button className=' cursor-pointer' onClick={() => onOpenDetail(item)}>
                <ImagePreview className='w-full aspect-square rounded-t-2xl rounded-b-none' wrapperClassName='w-full!' isDisabled />
            </button>
            <div className="flex flex-1 flex-col gap-3">
                <Card.Header className="gap-1 px-4">
                    <Card.Title className="line-clamp-2">
                        <Button size='sm'
                            className={"bg-transparent px-0 py-0.5 h-auto whitespace-normal text-left transition-all hover:underline hover:text-datia-primary underline-offset-4 text-foreground"}
                            onPress={() => onOpenDetail(item)}
                        >
                            {item.item_name}
                        </Button>
                    </Card.Title>
                    <Card.Description className="line-clamp-2 text-[0.825rem]">{description}</Card.Description>
                </Card.Header>
                <Card.Footer className="mt-auto flex flex-col items-stretch gap-3 p-4 pt-0">
                    {price}
                    <Button className="w-full" isDisabled={existence <= 0 || !priceItem}>
                        <FaPlus />
                        Agregar al carrito
                    </Button>
                </Card.Footer>
            </div>
        </Card>
    )
}

function ProductDetailModal({ product, state }: { product: Product | null, state: ReturnType<typeof useOverlayState> }) {

    const existence = product ? getExistence(product) : 0

    const details = product ? [
        { label: "Medida", value: product.measure },
        { label: "Familia", value: product.family?.name?.toLowerCase() },
        { label: "Marca", value: product.brand?.name },
        { label: "Unidad", value: product.unit },
    ] : []

    return (
        <Modal state={state}>
            <Modal.Backdrop>
                <Modal.Container size="lg" scroll="outside">
                    <Modal.Dialog className="w-full max-w-4xl! p-0! overflow-hidden">
                        <Modal.CloseTrigger className="z-10" />
                        {product && (
                            <div className="grid md:grid-cols-2 p-6">
                                {/* w-full! sobrescribe el w-fit del trigger de ImagePreview */}
                                <ImagePreview
                                    className='w-full aspect-square rounded-none md:h-full'
                                    wrapperClassName='w-full!'
                                    isDisabled
                                />
                                <div className="flex flex-col gap-5 pl-6">
                                    <div className="grid gap-3 pe-8">
                                        <p className="text-sm text-datia-gray">SKU: {product.item_code}</p>
                                        <h2 className="font-semibold text-2xl leading-tight">{product.item_name}</h2>
                                    </div>
                                    <div className="flex items-end justify-between gap-3">
                                        <div className="grid">
                                            <p className="text-sm text-datia-gray">Precio</p>
                                            <p className="font-semibold text-2xl text-green-800">{currency.format(getPrice(product))}</p>
                                        </div>
                                        <p className={clsx(
                                            "text-sm py-1 px-3 rounded-lg font-medium",
                                            existence <= 0 && "text-red-700 bg-red-700/10",
                                            existence > 0 && existence <= 20 && "text-yellow-700 bg-yellow-700/10",
                                            existence > 20 && "text-green-700 bg-green-700/10",
                                        )}>
                                            {existence > 0 ? `Disp. ${existence.toLocaleString("es-MX")}` : "Sin existencia"}
                                        </p>
                                    </div>
                                    <Divider />
                                    <div className="grid grid-cols-2 gap-3">
                                        {details.map(detail => (
                                            <div key={detail.label} className="grid content-start">
                                                <p className="text-sm text-datia-gray">{detail.label}</p>
                                                <p className="font-semibold capitalize">{detail.value || "No disponible"}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 mt-auto pt-2">
                                        <Button variant='tertiary' className="flex-1" onPress={state.close}>
                                            Cerrar
                                        </Button>
                                        <Button className="flex-1" isDisabled={existence <= 0}>
                                            <FaPlus />
                                            Agregar al carrito
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
