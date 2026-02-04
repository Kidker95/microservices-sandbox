export type UpstreamQuote = {
    id: number;
    quote: string;
    author: string;
};

export type UpstreamQuotesList = {
    quotes: UpstreamQuote[];
    total: number;
    skip: number;
    limit: number;
};