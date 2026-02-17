import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { HeartIcon, LoaderIcon } from 'lucide-react';

import { Combobox, ComboboxItem } from '@/components/ui/combobox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppActions } from '@/hooks/use-app-actions';
import { useExplore } from '@/hooks/use-explore';

import type { ExploreMode } from '@/hooks/use-explore';

export function Explore() {
	const {
		exploreMode,
		setExploreMode,
		algorithmOptions,
		isAlgorithmsLoading,
		selectedAlgorithmId,
		docstringName,
	} = useExplore();
	const { setAlgorithm } = useAppActions();
	const [search, setSearch] = useState('');

	const searchPlaceholder = useMemo(() => {
		if (exploreMode === 'mine') return 'Search my algorithms...';
		if (exploreMode === 'liked') return 'Search liked algorithms...';
		return 'Search public algorithms...';
	}, [exploreMode]);

	return (
		<Combobox
			options={algorithmOptions}
			value={selectedAlgorithmId}
			onValueChange={setAlgorithm}
			ariaLabel="Algorithm"
			placeholder={docstringName || 'Algorithm'}
			searchPlaceholder={searchPlaceholder}
			showCheck={false}
			searchValue={search}
			onSearchValueChange={setSearch}
			emptyMessage="No algorithms found."
			contentHeader={
				<div className="border-b border-border/60 px-2 py-1 relative">
					<Tabs
						value={exploreMode}
						onValueChange={(next) => {
							setExploreMode(next as ExploreMode);
							setSearch('');
						}}
					>
						<TabsList variant="line" className="h-auto gap-0.5 p-0">
							<TabsTrigger value="search" className="h-7 px-2 text-xs">
								Public
							</TabsTrigger>
							<TabsTrigger value="mine" className="h-7 px-2 text-xs">
								Mine
							</TabsTrigger>
							<TabsTrigger value="liked" className="h-7 px-2 text-xs">
								Liked
							</TabsTrigger>
						</TabsList>
					</Tabs>
					{isAlgorithmsLoading ? (
						<LoaderIcon className="absolute right-3 top-2.5 size-3 animate-spin" />
					) : null}
				</div>
			}
		>
			{algorithmOptions.map((entry) => (
				<ComboboxItem key={entry.value} value={entry.value}>
					<div className="min-w-0 flex-1">
						<Link
							to="/{-$id}"
							params={{ id: entry.value }}
							search={(prev) => ({ ...prev, code: undefined })}
							preload="intent"
							className="truncate text-sm block hover:underline underline-offset-2"
						>
							{entry.label}
						</Link>
						<div className="truncate text-[11px] text-muted-foreground flex items-center gap-2">
							{entry.creatorName ? `@${entry.creatorName}` : ''}
							<span className="inline-flex items-center gap-1 tabular-nums">
								<HeartIcon className="size-3" />
								{typeof entry.likeCount === 'number' ? entry.likeCount : 0}
							</span>
						</div>
					</div>
				</ComboboxItem>
			))}
		</Combobox>
	);
}
