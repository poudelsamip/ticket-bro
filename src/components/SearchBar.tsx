import { useState, type FormEvent } from "react";

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function SearchBar({
    onSearch,
    placeholder = "search event",
}: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSearch(query.trim());
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl items-center rounded-md border-[1.5px] border-gray-500 bg-white shadow-sm"
        >
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent px-5 py-2 text-lg text-text-primary placeholder:text-text-muted outline-none"
            />
            <button
                type="submit"
                className="cursor-pointer px-5 text-lg text-text-primary hover:underline"
            >
                search
            </button>
        </form>
    );
}
