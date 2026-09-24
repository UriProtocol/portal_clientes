"use client"

import {
    EmptyState,
    Pagination,
    Skeleton,
    Spinner,
    Table,
    type SortDescriptor,
} from "@heroui/react"
import clsx from "clsx"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { ReactNode } from "react"
import { useCallback, useMemo } from "react"

export type DataTableColumn<T extends object> = {
    key: string
    label: string
    isRowHeader?: boolean
    sortable?: boolean
    render?: (item: T) => ReactNode
}

export type DataTablePagination = {
    currentPage: number
    lastPage: number
    from?: number | null
    to?: number | null
    total?: number | null
}

type DataTableProps<T extends object> = {
    columns: DataTableColumn<T>[]
    items: T[]
    getRowId: (item: T) => string | number

    isLoading?: boolean
    isValidating?: boolean
    skeletonRows?: number
    ariaLabel?: string
    emptyState?: ReactNode
    pagination?: DataTablePagination
    className?: string
    disableWhileValidating?: boolean
}

function getPageItems(
    current: number,
    last: number,
): Array<number | "..."> {
    if (last <= 1) {
        return [1]
    }

    const delta = 1
    const pages: number[] = []

    for (let i = 1; i <= last; i++) {
        if (
            i === 1 ||
            i === last ||
            (i >= current - delta && i <= current + delta)
        ) {
            pages.push(i)
        }
    }

    const result: Array<number | "..."> = []
    let previous: number | undefined

    for (const page of pages) {
        if (previous !== undefined) {
            if (page - previous === 2) {
                result.push(previous + 1)
            } else if (page - previous !== 1) {
                result.push("...")
            }
        }

        result.push(page)
        previous = page
    }

    return result
}

export default function DataTable<T extends object>({
    columns,
    items,
    getRowId,
    isLoading = false,
    isValidating = false,
    skeletonRows = 6,
    ariaLabel = "Data table",
    emptyState,
    pagination,
    className,
    disableWhileValidating = true,
}: DataTableProps<T>) {
    const showSkeleton = isLoading

    const skeletonItems = useMemo(
        () =>
            Array.from(
                { length: skeletonRows },
                (_, index) => ({
                    id: `skeleton-${index}`,
                }),
            ),
        [skeletonRows],
    )

    const pageItems = useMemo(() => {
        if (!pagination) {
            return []
        }

        return getPageItems(
            pagination.currentPage,
            pagination.lastPage,
        )
    }, [pagination])

    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const setPage = useCallback((newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", String(newPage))
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [pathname, router, searchParams])

    const sortBy = searchParams.get("sortBy")
    const sortDir = searchParams.get("sortDirection")
    const sortDirection = useMemo(() => {
        return sortDir === "desc" ? "descending" : "ascending"
    }, [sortDir])

    const sortDescriptor: SortDescriptor | undefined = sortBy
        ? {
            column: sortBy,
            direction:
                sortDirection === "descending" ? "descending" : "ascending",
        }
        : undefined

    const handleSortChange = useCallback((descriptor: SortDescriptor) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("sortBy", String(descriptor.column))
        const sortDirection = descriptor.direction === "descending" ? "desc" : "asc"
        params.set("sortDirection", sortDirection)
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [pathname, router, searchParams])

    const isPaginationDisabled =
        showSkeleton ||
        (disableWhileValidating && isValidating)

    return (
        <Table className=" bg-datia-primary/7.5">
            <Table.ScrollContainer
                className={clsx(
                    className,
                    isValidating && !showSkeleton
                        ? "opacity-60 transition-opacity"
                        : "transition-opacity",
                )}
            >
                <Table.Content
                    aria-label={ariaLabel}
                    sortDescriptor={sortDescriptor}
                    onSortChange={handleSortChange}
                >
                    <Table.Header columns={columns} className={"bg-transparent"}>
                        {(column) => (
                            <Table.Column
                                id={column.key}
                                isRowHeader={column.isRowHeader}
                                allowsSorting={column.sortable}
                                className={"text-datia-primary/60 font-semibold"}
                            >
                                {column.sortable
                                    ? ({ sortDirection }) => (
                                        <Table.SortableColumnHeader
                                            sortDirection={sortDirection}
                                        >
                                            {column.label}
                                        </Table.SortableColumnHeader>
                                    )
                                    : column.label}
                            </Table.Column>
                        )}
                    </Table.Header>

                    {showSkeleton ? (
                        <Table.Body
                            items={skeletonItems}
                            dependencies={[showSkeleton]}
                            renderEmptyState={() => null}
                        >
                            {(item) => (
                                <Table.Row
                                    id={item.id}
                                    columns={columns}
                                >
                                    {() => (
                                        <Table.Cell>
                                            <Skeleton className="h-4 w-3/4 rounded" />
                                        </Table.Cell>
                                    )}
                                </Table.Row>
                            )}
                        </Table.Body>
                    ) : (
                        <Table.Body<T>
                            items={items}
                            dependencies={[showSkeleton]}
                            renderEmptyState={() => (
                                <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                                    {emptyState ??
                                        "No se encontraron resultados"}
                                </EmptyState>
                            )}
                        >
                            {(item) => (
                                <Table.Row
                                    id={String(getRowId(item))}
                                    columns={columns}
                                >
                                    {(column) => {
                                        const currentColumn =
                                            column as DataTableColumn<T>

                                        return (
                                            <Table.Cell className={"text-sm"}>
                                                {currentColumn.render
                                                    ? currentColumn.render(
                                                        item,
                                                    )
                                                    : String(
                                                        (
                                                            item as Record<
                                                                string,
                                                                unknown
                                                            >
                                                        )[
                                                        currentColumn.key
                                                        ] ?? "-",
                                                    )}
                                            </Table.Cell>
                                        )
                                    }}
                                </Table.Row>
                            )}
                        </Table.Body>
                    )}
                </Table.Content>
            </Table.ScrollContainer>

            {pagination && (
                <Table.Footer>
                    <Pagination size="sm">
                        <Pagination.Summary className=" text-datia-primary/65">
                            {pagination.total !== undefined
                                ? `${pagination.from ?? 0} a ${pagination.to ?? 0
                                } de ${pagination.total ?? 0
                                } resultados`
                                : "Cargando..."}

                            {isValidating && !showSkeleton && (
                                <Spinner size="sm" />
                            )}
                        </Pagination.Summary>

                        <Pagination.Content>
                            <Pagination.Item>
                                <Pagination.Previous
                                    className="text-datia-primary"
                                    isDisabled={
                                        isPaginationDisabled ||
                                        pagination.currentPage <= 1
                                    }
                                    onPress={() =>
                                        setPage(
                                            Math.max(
                                                1,
                                                pagination.currentPage - 1,
                                            ),
                                        )
                                    }
                                >
                                    <Pagination.PreviousIcon />
                                    Prev.
                                </Pagination.Previous>
                            </Pagination.Item>

                            {pageItems.map((page, index) =>
                                page === "..." ? (
                                    <Pagination.Item
                                        key={`dots-${index}`}
                                    >
                                        <span className="px-2 text-datia-gray select-none">
                                            …
                                        </span>
                                    </Pagination.Item>
                                ) : (
                                    <Pagination.Item key={page}>
                                        <Pagination.Link
                                            className={clsx(" text-white bg-datia-primary/25", page === pagination.currentPage && "bg-datia-primary!")}
                                            isActive={
                                                page ===
                                                pagination.currentPage
                                            }
                                            isDisabled={
                                                isPaginationDisabled
                                            }
                                            onPress={() =>
                                                setPage(
                                                    page,
                                                )
                                            }
                                        >
                                            {page}
                                        </Pagination.Link>
                                    </Pagination.Item>
                                ),
                            )}

                            <Pagination.Item>
                                <Pagination.Next
                                    className="text-datia-primary"
                                    isDisabled={
                                        isPaginationDisabled ||
                                        pagination.currentPage >=
                                        pagination.lastPage
                                    }
                                    onPress={() =>
                                        setPage(
                                            Math.min(
                                                pagination.lastPage,
                                                pagination.currentPage + 1,
                                            ),
                                        )
                                    }
                                >
                                    Sig.
                                    <Pagination.NextIcon />
                                </Pagination.Next>
                            </Pagination.Item>
                        </Pagination.Content>
                    </Pagination>
                </Table.Footer>
            )}
        </Table>
    )
}