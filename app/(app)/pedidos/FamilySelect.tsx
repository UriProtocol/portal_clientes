"use client"
import { axios } from '@/lib/axios'
import { Label, ListBox, Select } from '@heroui/react'
import { usePathname, useSearchParams } from 'next/navigation'
import useSWR from 'swr'

type Family = {
    id: number
    uuid: string
    name: string
}

type Paginated<T> = {
    data: T[]
}

// FamilyController@index lee perPage/search desde $request->params
const fetcher = (url: string) =>
    axios.get<Paginated<Family>>(url, {
        params: {
            sortBy: "name",
            order: "asc",
            params: { perPage: 100, search: "" },
        },
    }).then(res => res.data.data)

export default function FamilySelect({ className }: { className?: string }) {

    const searchParams = useSearchParams()
    const pathname = usePathname()

    const { data: families = [], isLoading } = useSWR("/families", fetcher)

    const handleChange = (key: string | null) => {
        if (key === searchParams.get("family")) return

        const params = new URLSearchParams(searchParams)
        if (key) {
            params.set("family", key)
        } else {
            params.delete("family")
        }
        params.set("page", "1")
        window.history.pushState(null, "", `${pathname}?${params.toString()}`)
    }

    return (
        <Select
            placeholder={isLoading ? 'Cargando...' : 'Todas las familias'}
            className={className}
            isDisabled={isLoading}
            value={searchParams.get("family")}
            onChange={key => handleChange(key as string | null)}
            onClear={() => handleChange(null)}
        >
            <Label>Familia</Label>
            <Select.Trigger>
                <Select.Value />
                <Select.ClearButton />
                <Select.Indicator />
            </Select.Trigger>
            {/* max-h-* no funciona: React Aria fija max-height inline según el viewport */}
            <Select.Popover maxHeight={360}>
                <ListBox<Family>
                    items={families}
                    renderEmptyState={() => (
                        <p className='text-datia-gray text-sm p-2'>No hay familias</p>
                    )}
                >
                    {family => (
                        <ListBox.Item id={family.uuid} textValue={family.name}>
                            <Label>{family.name}</Label>
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    )}
                </ListBox>
            </Select.Popover>
        </Select>
    )
}
