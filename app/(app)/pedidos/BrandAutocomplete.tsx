"use client"
import { axios } from '@/lib/axios'
import { Autocomplete, Label, ListBox, SearchField, Spinner } from '@heroui/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Collection, ListBoxLoadMoreItem } from 'react-aria-components'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { useDebounce } from 'use-debounce'

type Brand = {
    id: number
    uuid: string
    name: string
}

type Paginated<T> = {
    data: T[]
    current_page: number
    last_page: number
}

// BrandController@index lee perPage/search desde $request->params; page lo lee paginate()
const fetcher = ([url, search, page]: [string, string, number]) =>
    axios.get<Paginated<Brand>>(url, {
        params: {
            page,
            sortBy: "name",
            order: "asc",
            params: { perPage: 20, search },
        },
    }).then(res => res.data)

export default function BrandAutocomplete({ className }: { className?: string }) {

    const searchParams = useSearchParams()
    const pathname = usePathname()
    const brandParam = searchParams.get("brand")

    const [search, setSearch] = useState("")
    const [debouncedSearch] = useDebounce(search, 400)
    const [selected, setSelected] = useState<Brand | null>(null)

    const { data: pages, isLoading, isValidating, size, setSize } = useSWRInfinite(
        (index, previous: Paginated<Brand> | null) => {
            if (previous && previous.current_page >= previous.last_page) return null
            return ["/brands", debouncedSearch, index + 1] as [string, string, number]
        },
        fetcher,
        { keepPreviousData: true, revalidateFirstPage: false },
    )
    const brands = useMemo(() => pages?.flatMap(p => p.data) ?? [], [pages])
    const lastPage = pages?.[pages.length - 1]
    const hasMore = !!lastPage && lastPage.current_page < lastPage.last_page
    const isLoadingMore = isValidating && size > (pages?.length ?? 0)

    // Recupera la marca seleccionada desde la URL (el index también busca por uuid)
    const { data: initial } = useSWR(
        brandParam && !selected ? ["/brands", brandParam, 1] : null,
        fetcher,
    )
    const selectedBrand = selected ?? initial?.data.find(b => b.uuid === brandParam) ?? null

    // El Select sólo muestra el valor si el item existe en la colección
    const items = useMemo(() => {
        if (!selectedBrand || brands.some(b => b.uuid === selectedBrand.uuid)) return brands
        return [selectedBrand, ...brands]
    }, [brands, selectedBrand])

    const handleChange = (key: string | null) => {
        const brand = items.find(b => b.uuid === key) ?? null
        setSelected(brand)

        const params = new URLSearchParams(searchParams)
        if (brand) {
            params.set("brand", brand.uuid)
        } else {
            params.delete("brand")
        }
        params.set("page", "1")
        window.history.pushState(null, "", `${pathname}?${params.toString()}`)
    }

    return (
        <Autocomplete
            placeholder='Todas las marcas'
            className={className}
            value={selectedBrand?.uuid ?? null}
            onChange={key => handleChange(key as string | null)}
            onClear={() => handleChange(null)}
        >
            <Label>Marca</Label>
            <Autocomplete.Trigger>
                <Autocomplete.Value />
                <Autocomplete.ClearButton />
                <Autocomplete.Indicator />
            </Autocomplete.Trigger>
            <Autocomplete.Popover maxHeight={360}>
                {/* Sin prop filter: el filtrado lo hace el backend */}
                <Autocomplete.Filter inputValue={search} onInputChange={setSearch}>
                    <SearchField autoFocus name="search" aria-label="Buscar marca">
                        <SearchField.Group>
                            <SearchField.SearchIcon />
                            <SearchField.Input placeholder='Buscar marca...'/>
                            {isLoading ? <Spinner size='sm' className='mr-2 text-datia-primary' /> : <SearchField.ClearButton />}
                        </SearchField.Group>
                    </SearchField>
                    <ListBox
                        renderEmptyState={() => (
                            <p className='text-datia-gray text-sm p-2'>
                                {isLoading ? "Cargando..." : "No se encontraron marcas"}
                            </p>
                        )}
                    >
                        <Collection items={items}>
                            {brand => (
                                <ListBox.Item id={brand.uuid} textValue={brand.name}>
                                    <Label>{brand.name}</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            )}
                        </Collection>
                        {/* Carga la siguiente página al acercarse al final del scroll */}
                        <ListBoxLoadMoreItem
                            isLoading={isLoadingMore}
                            onLoadMore={() => {
                                if (hasMore && !isValidating) setSize(size + 1)
                            }}
                            className='flex justify-center py-2'
                        >
                            <Spinner size='sm' className='text-datia-primary'/>
                        </ListBoxLoadMoreItem>
                    </ListBox>
                </Autocomplete.Filter>
            </Autocomplete.Popover>
        </Autocomplete>
    )
}
