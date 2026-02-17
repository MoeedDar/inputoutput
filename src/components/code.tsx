import { EditorView } from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import CodeMirror from '@uiw/react-codemirror';
import { useLocalstorageState } from 'rooks';

import { Help } from '@/components/help';
import { Toggle } from '@/components/ui/toggle';
import { useAppActions } from '@/hooks/use-app-actions';
import { useAppState } from '@/hooks/use-app-state';
import { extension, theme } from '@/utils/code';

export function Code() {
	const { parameters } = useAppState();
	const { setCode } = useAppActions();
	const [vimEnabled, setVimEnabled] = useLocalstorageState('vim', false);
	const [helpOpen, setHelpOpen] = useLocalstorageState('help', false);
	const extensions = [
		theme,
		extension(),
		EditorView.lineWrapping,
		vimEnabled ? [vim()] : [],
	].filter(Boolean);

	return (
		<section className="h-full flex flex-col">
			<CodeMirror
				className="grow"
				value={parameters.code}
				extensions={extensions}
				onChange={setCode}
			/>
			<footer className="flex justify-end gap-1 p-1">
				<Toggle
					variant="ghost"
					size="sm"
					className="h-6 text-muted-foreground text-xs p-1 border-none data-[state=on]:bg-transparent"
					pressed={helpOpen}
					onPressedChange={setHelpOpen}
				>
					Help {helpOpen ? 'On' : 'Off'}
				</Toggle>
				<Toggle
					variant="ghost"
					size="sm"
					className="h-6 text-xs border-none p-1 text-muted-foreground data-[state=on]:bg-transparent"
					pressed={vimEnabled}
					onPressedChange={setVimEnabled}
				>
					Vim {vimEnabled ? 'On' : 'Off'}
				</Toggle>
			</footer>
			{helpOpen && <Help />}
		</section>
	);
}
