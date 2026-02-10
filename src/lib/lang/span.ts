export type Span = { start: number; end: number };
export type WithSpan<T> = T & Span;
