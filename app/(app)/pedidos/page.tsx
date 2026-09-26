"use client"
import Divider from '@/components/misc/Divider'
import QueryInput from '@/components/misc/QueryInput'
import { Button, ButtonGroup, Card } from '@heroui/react'
import { motion } from 'framer-motion'
import BrandAutocomplete from './BrandAutocomplete'
import FamilySelect from './FamilySelect'
import { FaCartShopping, FaList, FaPlus, FaRuler } from 'react-icons/fa6'
export default function Pedidos() {

    const [listType, setListType] = useState<"list" | "grid">("list")

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
                    className={"mt-auto mb-4"}
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
                            <Button variant={"tertiary"} className={clsx(listType != "list" && "opacity-50")} onPress={() => setListType("list")}>
                                <FaList />
                            </Button>
                            <Button variant={"tertiary"} className={clsx(listType != "grid" && "opacity-50")} onPress={() => setListType("grid")}>
                                <BsGridFill />
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div className='flex flex-col gap-3 mt-6'>
                    <p className='text-datia-gray text-sm'>
                        X productos · Vista de {listType == "list" ? "lista" : "cuadrícula"}
                    </p>
                    <div
                        className={clsx(
                            "grid gap-3 w-full",
                            listType === "grid" && "grid-cols-2 lg:grid-cols-3 gap-5"
                        )}
                    >
                        <ItemCard item={null} variant={listType} />
                        <ItemCard item={null} variant={listType} />
                        <ItemCard item={null} variant={listType} />
                    </div>
                </div>
            </div>
        </>
    )
}

import { InputGroup, TextField } from '@heroui/react'
import clsx from 'clsx';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react'
import { FaXmark } from 'react-icons/fa6';
import { useDebouncedCallback } from 'use-debounce';
import { TbRulerMeasure2 } from 'react-icons/tb'
import { BsGridFill } from 'react-icons/bs'
import ImagePreview from '@/components/misc/ImagePreview'
import { useAuth } from '@/hooks/auth/auth'

function MeasureInput({ placeholder }: { placeholder?: string }) {

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

function ItemCard({ item, variant }: { item: any, variant: "list" | "grid" }) {

    const {user} = useAuth()

    if (variant === "list") {

        return (
            <Card className="w-full gap-4 flex-row">
                <div className="relative h-24 shrink-0 overflow-hidden rounded-2xl ">
                    <ImagePreview className='size-24' />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                    <Card.Header className="gap-1">
                        <Card.Title className="pe-8">Become an ACME Creator!</Card.Title>
                        <Card.Description>
                            Lorem ipsum dolor sit amet consectetur. Sed arcu donec id aliquam dolor sed amet
                            faucibus etiam.
                        </Card.Description>
                    </Card.Header>
                    <Card.Footer className="mt-auto flex w-ful gap-3 flex-row items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Only 10 spots</span>
                            <span className="text-xs text-muted">Submission ends Oct 10.</span>
                        </div>
                        <Button className="w-fit">
                            <FaPlus />
                            Agregar al carrito
                        </Button>
                    </Card.Footer>
                </div>
            </Card>
        )
    }
    return (
        <Card className="w-full h-full gap-3 p-0">
            {/* w-full! sobrescribe el w-fit del trigger de ImagePreview */}
            <ImagePreview className='w-full aspect-square rounded-t-2xl rounded-b-none' wrapperClassName='w-full!' />
            <div className="flex flex-1 flex-col gap-3">
                <Card.Header className="gap-1 px-4">
                    <Card.Title className="line-clamp-2">Become an ACME Creator!</Card.Title>
                    <Card.Description className="line-clamp-2">
                        Lorem ipsum dolor sit amet consectetur. Sed arcu donec id aliquam dolor sed amet
                        faucibus etiam.
                    </Card.Description>
                </Card.Header>
                <Card.Footer className="mt-auto flex flex-col items-stretch gap-3 p-4 pt-0">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">Only 10 spots</span>
                        <span className="text-xs text-muted">Submission ends Oct 10.</span>
                    </div>
                    <Button className="w-full">
                        <FaPlus />
                        Agregar al carrito
                    </Button>
                </Card.Footer>
            </div>
        </Card>
    )
}