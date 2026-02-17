import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/css';

export type ComboboxOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

type ComboboxContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
	options: ComboboxOption[];
	selectedValue: string;
	selectedOption?: ComboboxOption;
	setValue: (value: string) => void;
	placeholder: string;
	searchPlaceholder: string;
	emptyMessage: string;
	disabled: boolean;
	showCheck: boolean;
};

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

function useComboboxContext() {
	const context = React.useContext(ComboboxContext);
	if (!context) {
		throw new Error('Combobox components must be used within ComboboxRoot.');
	}
	return context;
}

export type ComboboxRootProps = {
	options: ComboboxOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	showCheck?: boolean;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	disabled?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	searchValue?: string;
	onSearchValueChange?: (value: string) => void;
	children?: React.ReactNode;
};

function ComboboxRoot({
	options,
	value,
	defaultValue = '',
	onValueChange,
	showCheck = true,
	placeholder = 'Select an option...',
	searchPlaceholder = 'Search...',
	emptyMessage = 'No results found.',
	disabled = false,
	open: openProp,
	onOpenChange,
	searchValue,
	onSearchValueChange,
	children,
}: ComboboxRootProps) {
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const isControlled = value !== undefined;
	const selectedValue = isControlled ? value : internalValue;
	const selectedOption = options.find((option) => option.value === selectedValue);
	const [internalOpen, setInternalOpen] = React.useState(false);
	const open = openProp ?? internalOpen;

	const setOpen = (next: boolean) => {
		if (openProp === undefined) {
			setInternalOpen(next);
		}
		onOpenChange?.(next);
	};

	const setValue = (next: string) => {
		if (!isControlled) {
			setInternalValue(next);
		}
		onValueChange?.(next);
	};

	return (
		<ComboboxContext.Provider
			value={{
				open,
				setOpen,
				options,
				selectedValue,
				selectedOption,
				setValue,
				placeholder,
				searchPlaceholder,
				emptyMessage,
				disabled,
				showCheck,
			}}
		>
			<Popover open={open} onOpenChange={setOpen}>
				{children}
			</Popover>
		</ComboboxContext.Provider>
	);
}

type ComboboxTriggerProps = {
	className?: string;
	ariaLabel?: string;
	showChevron?: boolean;
	title?: string;
	children?: React.ReactNode;
	asChild?: boolean;
};

function ComboboxTrigger({
	className,
	ariaLabel,
	showChevron = true,
	title,
	children,
	asChild = false,
}: ComboboxTriggerProps) {
	const { open, disabled } = useComboboxContext();

	if (asChild) {
		return <PopoverTrigger asChild>{children}</PopoverTrigger>;
	}

	return (
		<PopoverTrigger asChild>
			<Button
				variant="outline"
				role="combobox"
				aria-expanded={open}
				aria-label={ariaLabel}
				disabled={disabled}
				className={cn(
					'w-full justify-between rounded-none border-0 border-b border-transparent hover:bg-accent/30 aria-expanded:bg-transparent focus-visible:border-b focus-visible:border-border focus-visible:outline-none focus-visible:ring-0',
					className,
				)}
				title={title}
			>
				{children ?? <ComboboxValue />}
				{showChevron ? <ChevronsUpDownIcon className="ml-2 size-3 shrink-0 opacity-60" /> : null}
			</Button>
		</PopoverTrigger>
	);
}

type ComboboxValueProps = {
	className?: string;
	placeholder?: string;
};

function ComboboxValue({ className, placeholder }: ComboboxValueProps) {
	const { selectedOption, placeholder: fallbackPlaceholder } = useComboboxContext();
	const text = selectedOption?.label ?? placeholder ?? fallbackPlaceholder;

	return <span className={cn(!selectedOption && 'text-muted-foreground', className)}>{text}</span>;
}

type ComboboxContentProps = {
	className?: string;
	align?: React.ComponentProps<typeof PopoverContent>['align'];
	sideOffset?: React.ComponentProps<typeof PopoverContent>['sideOffset'];
	searchPlaceholder?: string;
	emptyMessage?: string;
	header?: React.ReactNode;
	searchValue?: string;
	onSearchValueChange?: (value: string) => void;
	children?: React.ReactNode;
};

function ComboboxContent({
	className,
	align = 'start',
	sideOffset = 0,
	searchPlaceholder,
	emptyMessage,
	header,
	searchValue,
	onSearchValueChange,
	children,
}: ComboboxContentProps) {
	const {
		options,
		searchPlaceholder: defaultSearchPlaceholder,
		emptyMessage: defaultEmptyMessage,
	} = useComboboxContext();

	return (
		<PopoverContent
			align={align}
			sideOffset={sideOffset}
			style={{ width: 'var(--radix-popover-trigger-width)' }}
			className={cn('border-0 p-0', className)}
		>
			<Command>
				<CommandInput
					placeholder={searchPlaceholder ?? defaultSearchPlaceholder}
					value={searchValue}
					onValueChange={onSearchValueChange}
				/>
				{header}
				<CommandList>
					<CommandEmpty>{emptyMessage ?? defaultEmptyMessage}</CommandEmpty>
					<CommandGroup>
						{children ??
							options.map((option) => (
								<ComboboxItem key={option.value} value={option.value} disabled={option.disabled}>
									{option.label}
								</ComboboxItem>
							))}
					</CommandGroup>
				</CommandList>
			</Command>
		</PopoverContent>
	);
}

type ComboboxItemProps = {
	value: string;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
	onSelect?: (value: string) => void;
};

function ComboboxItem({ value, disabled, children, className, onSelect }: ComboboxItemProps) {
	const { selectedValue, setValue, setOpen, showCheck } = useComboboxContext();

	return (
		<CommandItem
			value={value}
			disabled={disabled}
			onSelect={() => {
				setValue(value);
				setOpen(false);
				onSelect?.(value);
			}}
			className={className}
		>
			{showCheck ? (
				<CheckIcon
					className={cn('mr-2 size-3', value === selectedValue ? 'opacity-100' : 'opacity-0')}
				/>
			) : null}
			{children}
		</CommandItem>
	);
}

export type ComboboxProps = ComboboxRootProps & {
	ariaLabel?: string;
	title?: string;
	className?: string;
	buttonClassName?: string;
	contentClassName?: string;
	contentHeader?: React.ReactNode;
	children?: React.ReactNode;
};

function Combobox({
	options,
	value,
	defaultValue,
	onValueChange,
	placeholder,
	searchPlaceholder,
	emptyMessage,
	disabled,
	open,
	onOpenChange,
	searchValue,
	onSearchValueChange,
	showCheck,
	ariaLabel,
	title,
	className,
	buttonClassName,
	contentClassName,
	contentHeader,
	children,
}: ComboboxProps) {
	return (
		<ComboboxRoot
			options={options}
			value={value}
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			showCheck={showCheck}
			placeholder={placeholder}
			searchPlaceholder={searchPlaceholder}
			emptyMessage={emptyMessage}
			disabled={disabled}
			open={open}
			onOpenChange={onOpenChange}
			searchValue={searchValue}
			onSearchValueChange={onSearchValueChange}
		>
			<ComboboxTrigger className={buttonClassName} ariaLabel={ariaLabel} title={title} />
			<ComboboxContent
				className={cn(className, contentClassName)}
				searchPlaceholder={searchPlaceholder}
				emptyMessage={emptyMessage}
				header={contentHeader}
			>
				{children}
			</ComboboxContent>
		</ComboboxRoot>
	);
}

export { Combobox, ComboboxRoot, ComboboxTrigger, ComboboxValue, ComboboxContent, ComboboxItem };
