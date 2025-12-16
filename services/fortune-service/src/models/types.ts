export type UpstreamQuote = {
    id: number;
    quote: string;
    author: string;
};

export type Fortune = {
    fortune: string;
    author: string;
    source: string;
    fetchedAt: string;
};

export type UpstreamQuotesList = {
    quotes: UpstreamQuote[];
    total: number;
    skip: number;
    limit: number;
};