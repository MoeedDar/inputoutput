import { useQuery } from '@tanstack/react-query';

import { inputQuery } from '@/queries/input';

import type { Parameters } from '@/hooks/use-parameters';

export function useInput(parameters: Parameters) {
	return useQuery(inputQuery(parameters));
}
