import { Button, Input, InputGroup, TextField } from '@heroui/react'
import clsx from 'clsx';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { forwardRef, useState } from 'react'
import { FaSearch } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { useDebouncedCallback } from 'use-debounce';
import {motion} from 'framer-motion'

export default forwardRef(function QueryInput({ placeholder }: { placeholder?: string }, ref: React.ForwardedRef<HTMLInputElement>) {

    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [query, setQuery] = useState(searchParams.get("query") ?? "")

    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }
        params.set("page", "1");
        window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    }, 1000);

    const handleClear = () => {
        setQuery("")
        const params = new URLSearchParams(searchParams);
        params.delete("query");
        window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    };

    return (
        <motion.div
            layout
            className='w-full'
        >
            <TextField className="w-full" value={query} onChange={e =>{
                handleSearch(e)
                setQuery(e)
            }}>
                <InputGroup>
                    <InputGroup.Prefix>
                        <FaSearch className=' text-datia-primary/50'/>
                    </InputGroup.Prefix>
                    <InputGroup.Input
                        ref={ref}
                        placeholder={placeholder || "Buscar..."}
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
})
