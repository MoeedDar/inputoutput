import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { Combobox } from '@/components/ui/combobox';
import { NumberInput } from '@/components/ui/number-input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { algorithms } from '@/data/algorithms';
import { inputs } from '@/data/inputs';
import { getDocstrings } from '@/lib/lang';
import { Frequency } from '@/types';

type Props<T> = {
	value: T;
	onChange: (value: T) => void;
};

function FrequencySelect({ value, onChange }: Props<Frequency>) {
	const frequencyOptions = Object.values(Frequency).map((value) => ({
		value,
		label: value,
	}));

	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger aria-label="Frequency">
				<SelectValue placeholder="Frequency" />
			</SelectTrigger>
			<SelectContent>
				{frequencyOptions.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function AlgorithmCombobox({
	value,
	onChange,
	placeholder,
}: Props<string> & { placeholder?: string }) {
	const options = algorithms.map((algo) => ({
		value: algo.id,
		label: algo.name,
	}));

	return (
		<Combobox
			options={options}
			value={value}
			onValueChange={onChange}
			ariaLabel="Algorithm"
			placeholder={placeholder ?? 'Algorithm'}
			searchPlaceholder="Search algorithms..."
			showCheck={false}
		/>
	);
}

function InputCombobox({ value, onChange }: Props<string>) {
	const options = inputs.map((input) => ({
		value: input,
		label: input,
	}));

	return (
		<Combobox
			options={options}
			value={value}
			onValueChange={onChange}
			ariaLabel="Input instrument"
			placeholder="Input"
			searchPlaceholder="Search instruments..."
			showCheck={false}
		/>
	);
}

function SamplesInput({ value, onChange }: Props<number>) {
	const [draft, setDraft] = useState(String(value));

	useEffect(() => {
		setDraft(String(value));
	}, [value]);

	const clamp = (raw: number) => Math.min(1000, Math.max(5, raw));

	return (
		<NumberInput
			min={5}
			max={1000}
			value={draft}
			aria-label="Samples"
			label="Samples"
			onChange={(event) => {
				const nextDraft = event.currentTarget.value;
				setDraft(nextDraft);
				const raw = Number(nextDraft);
				if (Number.isFinite(raw)) {
					onChange(clamp(raw));
				}
			}}
			onBlur={() => {
				const raw = Number(draft);
				const next = Number.isFinite(raw) ? clamp(raw) : 5;
				setDraft(String(next));
				onChange(next);
			}}
			className="tabular-nums -z-50 w-full"
		/>
	);
}

function CostsInput({ value, onChange }: Props<number>) {
	const [draft, setDraft] = useState(String(value));

	useEffect(() => {
		setDraft(String(value));
	}, [value]);

	const clamp = (raw: number) => Math.min(0.1, Math.max(0, raw));

	return (
		<NumberInput
			min={0}
			max={0.1}
			step={0.0001}
			value={draft}
			aria-label="Costs"
			label="Costs"
			onChange={(event) => {
				const nextDraft = event.currentTarget.value;
				setDraft(nextDraft);
				const raw = Number(nextDraft);
				if (Number.isFinite(raw)) {
					onChange(clamp(raw));
				}
			}}
			onBlur={() => {
				const raw = Number(draft);
				const next = Number.isFinite(raw) ? clamp(raw) : 0;
				setDraft(String(next));
				onChange(next);
			}}
			className="tabular-nums -z-50 w-full"
		/>
	);
}

export function Header() {
	const search = useSearch({ from: '/' });
	const navigate = useNavigate({ from: '/' });
	const onChange = (key: string) => (value: unknown) =>
		void navigate({ search: (prev) => ({ ...prev, [key]: value }) });
	const onAlgorithmChange = (value: string) => {
		const selected = algorithms.find((algo) => algo.id === value);
		if (!selected) {
			void navigate({
				search: (prev) => ({
					...prev,
					code: undefined,
				}),
			});
			return;
		}
		void navigate({
			search: (prev) => ({
				...prev,
				code: selected.code,
			}),
		});
	};
	const selectedAlgorithm = algorithms.find((algo) => algo.code === search.code);
	const docstrings = getDocstrings(search.code ?? '');
	return (
		<header className="grid md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)_132px_132px]">
			<FrequencySelect value={search.frequency} onChange={onChange('frequency')} />
			<AlgorithmCombobox
				value={selectedAlgorithm?.id ?? ''}
				onChange={onAlgorithmChange}
				placeholder={docstrings.name}
			/>
			<InputCombobox value={search.input} onChange={onChange('input')} />
			<SamplesInput value={search.limit} onChange={onChange('limit')} />
			<CostsInput value={search.costs} onChange={onChange('costs')} />
		</header>
	);
}
