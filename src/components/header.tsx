import { useEffect } from 'react';
import {
	CheckIcon,
	GitForkIcon,
	HeartIcon,
	Loader2Icon,
	PlusIcon,
	SaveIcon,
	TrashIcon,
} from 'lucide-react';

import { Explore } from '@/components/explore';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { NumberInput } from '@/components/ui/number-input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { inputs } from '@/data/inputs';
import { useAppActions } from '@/hooks/use-app-actions';
import { useAppState } from '@/hooks/use-app-state';
import { Frequency } from '@/types';

function FrequencySelect() {
	const { parameters } = useAppState();
	const { setFrequency } = useAppActions();
	const frequencyOptions = Object.values(Frequency).map((entry) => ({
		value: entry,
		label: entry,
	}));

	return (
		<Select value={parameters.frequency} onValueChange={setFrequency}>
			<SelectTrigger aria-label="Frequency" title="Frequency">
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

function InputCombobox() {
	const { parameters } = useAppState();
	const { setInput } = useAppActions();
	const options = inputs.map((input) => ({
		value: input,
		label: input,
	}));

	return (
		<Combobox
			options={options}
			value={parameters.input}
			onValueChange={setInput}
			ariaLabel="Input instrument"
			title="Input instrument"
			placeholder="Input"
			searchPlaceholder="Search instruments..."
			showCheck={false}
		/>
	);
}

function SamplesInput() {
	const { parameters } = useAppState();
	const { setLimit } = useAppActions();

	return (
		<NumberInput
			min={5}
			max={1000}
			value={parameters.limit}
			aria-label="Samples"
			title="Samples"
			label="Samples"
			onValueChange={setLimit}
			fallbackValue={5}
			className="tabular-nums -z-50 w-full"
		/>
	);
}

function CostsInput() {
	const { parameters } = useAppState();
	const { setCosts } = useAppActions();

	return (
		<NumberInput
			min={0}
			max={0.1}
			step={0.0001}
			value={parameters.costs}
			aria-label="Costs"
			title="Costs"
			label="Costs"
			onValueChange={setCosts}
			fallbackValue={0}
			className="tabular-nums -z-50 w-full"
		/>
	);
}

function SaveButton() {
	const { parameters, isUnchanged } = useAppState();
	const { save, isSaving } = useAppActions();

	return (
		<Button
			variant="ghost"
			className="justify-start md:justify-center px-2 md:size-8 md:px-0"
			disabled={isSaving || !parameters.code}
			onClick={() => {
				void save();
			}}
			aria-label={isSaving ? 'Saving...' : isUnchanged ? 'Saved' : 'Save'}
			title={isSaving ? 'Saving...' : isUnchanged ? 'Saved' : 'Save'}
		>
			{isSaving ? (
				<Loader2Icon className="animate-spin" />
			) : isUnchanged ? (
				<CheckIcon />
			) : (
				<SaveIcon />
			)}
		</Button>
	);
}

function NewButton() {
	const { newAlgorithm } = useAppActions();

	return (
		<Button
			variant="ghost"
			className="justify-start md:justify-center px-2 md:size-8 md:px-0"
			onClick={newAlgorithm}
			aria-label="New algorithm"
			title="New algorithm"
		>
			<PlusIcon />
		</Button>
	);
}

function ForkButton() {
	const { fork, isSaving } = useAppActions();

	return (
		<Button
			variant="ghost"
			className="justify-start md:justify-center px-2 md:size-8 md:px-0"
			disabled={isSaving}
			onClick={() => {
				void fork();
			}}
			aria-label={isSaving ? 'Forking...' : 'Fork algorithm'}
			title={isSaving ? 'Forking...' : 'Fork algorithm'}
		>
			{isSaving ? <Loader2Icon className="animate-spin" /> : <GitForkIcon />}
		</Button>
	);
}

function VisibilitySelect() {
	const { algorithm } = useAppState();
	const { setVisibility, isSettingVisibility, isDeleting } = useAppActions();

	if (!algorithm) return null;

	return (
		<Select
			value={algorithm.visibility}
			onValueChange={(next) => setVisibility(next as 'public' | 'unlisted' | 'private')}
			disabled={isSettingVisibility || isDeleting}
		>
			<SelectTrigger
				className="md:w-fit"
				aria-label="Algorithm visibility"
				title="Algorithm visibility"
			>
				<SelectValue />
				{isSettingVisibility ? <Loader2Icon className="ml-2 size-3 animate-spin" /> : null}
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="public">Public</SelectItem>
				<SelectItem value="unlisted">Unlisted</SelectItem>
				<SelectItem value="private">Private</SelectItem>
			</SelectContent>
		</Select>
	);
}

function DeleteButton() {
	const { remove, isDeleting, isSettingVisibility } = useAppActions();

	return (
		<Button
			variant="ghost"
			className="justify-start md:justify-center px-2 md:size-8 md:px-0"
			disabled={isDeleting || isSettingVisibility}
			onClick={remove}
			aria-label="Delete algorithm"
			title="Delete algorithm"
		>
			{isDeleting ? <Loader2Icon className="animate-spin" /> : <TrashIcon />}
		</Button>
	);
}

function LikeButton() {
	const { algorithm, canLike, liked, likeCount } = useAppState();
	const { toggleLike, isLiking } = useAppActions();

	if (!algorithm) return null;

	return (
		<Button
			variant="ghost"
			className="justify-start md:justify-center px-2 md:px-2"
			disabled={!canLike || isLiking}
			onClick={() => {
				void toggleLike();
			}}
			aria-label={liked ? 'Unlike algorithm' : 'Like algorithm'}
			title={liked ? 'Unlike algorithm' : 'Like algorithm'}
		>
			{isLiking ? (
				<Loader2Icon className="animate-spin" />
			) : (
				<HeartIcon className={liked ? 'fill-current' : undefined} />
			)}
			<span className="pl-1 tabular-nums">{likeCount}</span>
		</Button>
	);
}

function HeaderParameters() {
	return (
		<>
			<FrequencySelect />
			<Explore />
			<InputCombobox />
			<SamplesInput />
			<CostsInput />
		</>
	);
}

function HeaderActions() {
	const { algorithm, isOwner, isUnchanged, error } = useAppState();
	const { save, isSaving, isDeleting, isSettingVisibility } = useAppActions();
	const showFork = algorithm != null && !isOwner;
	const showSave = algorithm == null || isOwner;
	const showOwnerActions = algorithm != null && isOwner;
	const shouldAutoSave =
		algorithm != null &&
		isOwner &&
		!isUnchanged &&
		!error &&
		!isSaving &&
		!isDeleting &&
		!isSettingVisibility;

	useEffect(() => {
		if (!shouldAutoSave) {
			return;
		}
		const timer = setTimeout(() => {
			void save();
		}, 650);
		return () => clearTimeout(timer);
	}, [save, shouldAutoSave]);

	return (
		<div className="flex items-center justify-end gap-1 min-w-0 overflow-hidden">
			{showOwnerActions ? (
				<div className="flex items-center gap-1 shrink-0">
					<VisibilitySelect />
					<DeleteButton />
				</div>
			) : null}
			{showFork ? <ForkButton /> : null}
			{showSave ? <SaveButton /> : null}
			<NewButton />
			<LikeButton />
		</div>
	);
}

export function Header() {
	return (
		<header className="grid md:grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)_128px_128px_minmax(0,1fr)]">
			<HeaderParameters />
			<HeaderActions />
		</header>
	);
}
