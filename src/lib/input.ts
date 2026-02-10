import { SOURCES } from '@/lib/sources';
import type { InputParameters } from '@/types';

export async function getInput(parameters: InputParameters) {
	const instrument = getInstrument(parameters.input);
	if (!instrument) return SOURCES.empty(parameters);
	try {
		const source = SOURCES[instrument.venue];
		return await source(parameters, instrument);
	} catch {
		return SOURCES.empty(parameters);
	}
}

function getInstrument(id: string) {
	const [core, expiry] = id.toLowerCase().split(':');
	const [venue, type, base, quote] = core.split('-');
	return {
		venue: venue as keyof typeof SOURCES,
		type,
		base,
		quote,
		expiry: expiry ? Number(expiry) : undefined,
	};
}
