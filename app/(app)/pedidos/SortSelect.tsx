"use client"
import { Label, ListBox, Select } from '@heroui/react'
import { usePathname, useSearchParams } from 'next/navigation'

// La clave en la URL es "<sortBy>_<order>", p. ej. price_asc
export const SORT_OPTIONS = [
    { id: "price_asc", label: "Precio: menor a mayor" },
    { id: "price_desc", label: "Precio: mayor a menor" },
    { id: "existence_desc", label: "Existencia: mayor a menor" },
    { id: "existence_asc", label: "Existencia: menor a mayor" },
]

export function parseSort(sort: string | null) {
    if (!sort || !SORT_OPTIONS.some(option => option.id === sort)) return { sortBy: "", order: "" }
    const [sortBy, order] = sort.split("_")
    return { sortBy, order }
}

export default function SortSelect({ className }: { className?: string }) {

    const searchParams = useSearchParams()
    const pathname = usePathname()

    const handleChange = (key: string | null) => {
        if (key === searchParams.get("sort")) return

        const params = new URLSearchParams(searchParams)
        if (key) {
            params.set("sort", key)
        } else {
            params.delete("sort")
        }
        params.set("page", "1")
        window.history.pushState(null, "", `${pathname}?${params.toString()}`)
    }

    return (
        <Select
            placeholder='Por defecto'
            className={className}
            value={searchParams.get("sort")}
            onChange={key => handleChange(key as string | null)}
            onClear={() => handleChange(null)}
        >
            <Label>Ordenar por:</Label>
            <Select.Trigger>
                <Select.Value />
                <Select.ClearButton />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox items={SORT_OPTIONS}>
                    {option => (
                        <ListBox.Item id={option.id} textValue={option.label}>
                            <Label>{option.label}</Label>
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    )}
                </ListBox>
            </Select.Popover>
        </Select>
    )
}
