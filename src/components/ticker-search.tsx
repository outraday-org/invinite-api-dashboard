"use client";

import { useNavigate } from "@tanstack/react-router";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { ErrorState } from "@/components/ui/error-state";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCompanySearch } from "@/lib/api/queries";

type TickerSearchProps = {
    defaultTicker?: string;
    placeholder?: string;
};

export function TickerSearch({ defaultTicker = "", placeholder = "Search by ticker or name" }: TickerSearchProps) {
    const navigate = useNavigate({ from: "/" });

    const [input, setInput] = React.useState(defaultTicker);

    const trimmedQuery = input.trim();

    const [debouncedQuery, setDebouncedQuery] = React.useState(trimmedQuery);

    const debounceMs = 250;

    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedQuery(trimmedQuery);
        }, debounceMs);

        return () => window.clearTimeout(timer);
    }, [trimmedQuery, debounceMs]);

    const { data, error, isFetching } = useCompanySearch(debouncedQuery);

    const companies = data?.companies ?? [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const target = trimmedQuery.toUpperCase();

        if (target) {
            navigate({ params: { ticker: target }, to: "/$ticker" });
        }
    };

    const handleSelect = (value: string) => {
        setInput(value);

        navigate({ params: { ticker: value.toUpperCase() }, to: "/$ticker" });
    };

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            <Field>
                <FieldLabel htmlFor="ticker-search">Ticker</FieldLabel>
                <Combobox items={companies.map(c => c.ticker)}>
                    <div className="flex items-center gap-2">
                        <ComboboxInput
                            onChange={event => setInput(event.target.value)}
                            value={input}
                        >
                            <Input
                                autoComplete="off"
                                id="ticker-search"
                                placeholder={placeholder}
                            />
                        </ComboboxInput>
                        <Button disabled={isFetching || input.trim().length === 0} type="submit">
                            Go
                        </Button>
                    </div>
                    <ComboboxContent>
                        <ComboboxEmpty>No companies found</ComboboxEmpty>
                        <ComboboxList>
                            {(ticker) => {
                                const company = companies.find(c => c.ticker === ticker);

                                return (
                                    <ComboboxItem
                                        key={ticker}
                                        onClick={() => handleSelect(ticker)}
                                        value={ticker}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{ticker}</span>
                                            {company
                                                ? (
                                                        <span className="text-muted-foreground text-xs">
                                                            {company.name}
                                                        </span>
                                                    )
                                                : null}
                                        </div>
                                    </ComboboxItem>
                                );
                            }}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </Field>
            {error
                ? (
                        <ErrorState
                            error={error}
                            title="Failed to search companies"
                        />
                    )
                : null}
        </form>
    );
}
