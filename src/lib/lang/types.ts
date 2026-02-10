export type TypeOf<T extends { type: string }> = T['type'];
export type OfType<T extends { type: string }, K extends TypeOf<T>> = T extends { type: K }
	? T
	: never;
