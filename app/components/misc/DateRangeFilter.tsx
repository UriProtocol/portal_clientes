"use client"
import { Calendar, DateField, DatePicker, DateRangePicker, Label, RangeCalendar } from "@heroui/react"
import { DateValue, parseDate } from "@internationalized/date"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { motion } from 'framer-motion'

export interface DateRangeFilterProps {
    /**
     * "range" renders a single DateRangePicker (one popover, one calendar with two selectable ends).
     * "split" renders two independent DatePickers, one for the start date and one for the end date.
     */
    variant?: "range" | "split"
    startParam?: string
    endParam?: string
    label?: string
    startLabel?: string
    endLabel?: string
    className?: string
    /** Reset the "page" search param when the date range changes, matching the table pagination convention. */
    resetPageOnChange?: boolean
}

function toDateValue(value: string | null): DateValue | undefined {
    if (!value) return undefined
    try {
        return parseDate(value)
    } catch {
        return undefined
    }
}

export default function DateRangeFilter({
    variant = "range",
    startParam = "startDate",
    endParam = "endDate",
    label = "Filtrar por fecha",
    startLabel = "Desde",
    endLabel = "Hasta",
    className,
    resetPageOnChange = true,
}: DateRangeFilterProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const startValue = useMemo(() => toDateValue(searchParams.get(startParam)), [searchParams, startParam])
    const endValue = useMemo(() => toDateValue(searchParams.get(endParam)), [searchParams, endParam])

    const updateParams = useCallback((updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString())
        for (const [key, value] of Object.entries(updates)) {
            if (value) params.set(key, value)
            else params.delete(key)
        }
        if (resetPageOnChange) params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [pathname, router, searchParams, resetPageOnChange])

    const handleRangeChange = useCallback((value: { start: DateValue; end: DateValue } | null) => {
        updateParams({
            [startParam]: value?.start?.toString(),
            [endParam]: value?.end?.toString(),
        })
    }, [startParam, endParam, updateParams])

    // minValue/maxValue on the DatePickers only disable calendar cells and mark typed
    // segments as invalid — they don't stop an out-of-range value from being committed
    // via onChange, so an inconsistent range still needs to be corrected here.
    const handleStartChange = useCallback((value: DateValue | null) => {
        const updates: Record<string, string | undefined> = { [startParam]: value?.toString() }
        if (value && endValue && value.compare(endValue) > 0) {
            updates[endParam] = value.toString()
        }
        updateParams(updates)
    }, [startParam, endParam, endValue, updateParams])

    const handleEndChange = useCallback((value: DateValue | null) => {
        const updates: Record<string, string | undefined> = { [endParam]: value?.toString() }
        if (value && startValue && value.compare(startValue) < 0) {
            updates[startParam] = value.toString()
        }
        updateParams(updates)
    }, [endParam, startParam, startValue, updateParams])

    if (variant === "split") {
        return (
            <div className={className}>
                <div className="flex gap-3 w-full">
                    <motion.div layout>
                        <DatePicker className="w-full" value={startValue ?? null} maxValue={endValue} onChange={handleStartChange}>
                            <Label>{startLabel}</Label>
                            <DateField.Group fullWidth>
                                <DateField.Input>
                                    {(segment) => <DateField.Segment segment={segment} />}
                                </DateField.Input>
                                <DateField.Suffix>
                                    <DatePicker.Trigger>
                                        <DatePicker.TriggerIndicator className=" text-datia-primary/50" />
                                    </DatePicker.Trigger>
                                </DateField.Suffix>
                            </DateField.Group>
                            <DatePicker.Popover>
                                <Calendar aria-label={startLabel}>
                                    <Calendar.Header>
                                        <Calendar.YearPickerTrigger>
                                            <Calendar.YearPickerTriggerHeading />
                                            <Calendar.YearPickerTriggerIndicator className=" text-datia-primary/50" />
                                        </Calendar.YearPickerTrigger>
                                        <Calendar.NavButton slot="previous" className=" text-datia-primary/40" />
                                        <Calendar.NavButton slot="next" className=" text-datia-primary/40" />
                                    </Calendar.Header>
                                    <Calendar.Grid>
                                        <Calendar.GridHeader>
                                            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                        </Calendar.GridHeader>
                                        <Calendar.GridBody>
                                            {(date) => <Calendar.Cell
                                                className={
                                                    "data-[selected=true]:bg-datia-primary! data-[selected=true]:text-white! data-[today=true]:bg-datia-primary/15 data-[today=true]:text-datia-primary data-[hovered=true]:bg-datia-primary/10"
                                                }
                                                date={date}
                                            />}
                                        </Calendar.GridBody>
                                    </Calendar.Grid>
                                    <Calendar.YearPickerGrid>
                                        <Calendar.YearPickerGridBody>
                                            {({ year }) => <Calendar.YearPickerCell year={year} />}
                                        </Calendar.YearPickerGridBody>
                                    </Calendar.YearPickerGrid>
                                </Calendar>
                            </DatePicker.Popover>
                        </DatePicker>
                    </motion.div>
                    <motion.div layout>
                        <DatePicker className="w-full" value={endValue ?? null} minValue={startValue} onChange={handleEndChange}>
                            <Label>{endLabel}</Label>
                            <DateField.Group fullWidth>
                                <DateField.Input>
                                    {(segment) => <DateField.Segment segment={segment} />}
                                </DateField.Input>
                                <DateField.Suffix>
                                    <DatePicker.Trigger>
                                        <DatePicker.TriggerIndicator className=" text-datia-primary/50" />
                                    </DatePicker.Trigger>
                                </DateField.Suffix>
                            </DateField.Group>
                            <DatePicker.Popover>
                                <Calendar aria-label={endLabel}>
                                    <Calendar.Header>
                                        <Calendar.YearPickerTrigger>
                                            <Calendar.YearPickerTriggerHeading />
                                            <Calendar.YearPickerTriggerIndicator className=" text-datia-primary/50" />
                                        </Calendar.YearPickerTrigger>
                                        <Calendar.NavButton slot="previous" className=" text-datia-primary/40" />
                                        <Calendar.NavButton slot="next" className=" text-datia-primary/40" />
                                    </Calendar.Header>
                                    <Calendar.Grid>
                                        <Calendar.GridHeader>
                                            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                        </Calendar.GridHeader>
                                        <Calendar.GridBody>
                                            {(date) => <Calendar.Cell
                                                className={
                                                    "data-[selected=true]:bg-datia-primary! data-[selected=true]:text-white! data-[today=true]:bg-datia-primary/15 data-[today=true]:text-datia-primary data-[hovered=true]:bg-datia-primary/10"
                                                }
                                                date={date}
                                            />}
                                        </Calendar.GridBody>
                                    </Calendar.Grid>
                                    <Calendar.YearPickerGrid>
                                        <Calendar.YearPickerGridBody>
                                            {({ year }) => <Calendar.YearPickerCell year={year} />}
                                        </Calendar.YearPickerGridBody>
                                    </Calendar.YearPickerGrid>
                                </Calendar>
                            </DatePicker.Popover>
                        </DatePicker>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <DateRangePicker
            className={className}
            startName={startParam}
            endName={endParam}
            value={startValue && endValue ? { start: startValue, end: endValue } : null}
            onChange={handleRangeChange}
        >
            <Label>{label}</Label>
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
                <RangeCalendar aria-label={label}>
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
    )
}
