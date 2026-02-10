import { EditorView } from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import CodeMirror from '@uiw/react-codemirror';
import { useLocalstorageState } from 'rooks';

import { Help } from '@/components/help';
import { Toggle } from '@/components/ui/toggle';
import { extension, theme } from '@/utils/code';

type CodeProps = {
	value: string;
	onChange: (value: string) => void;
};

export function Code({ value, onChange }: CodeProps) {
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
			<style>
				{`
  .cm-editor ::selection: {
  filter: invert();
  },
		`}
			</style>
			<CodeMirror className="grow" value={value} extensions={extensions} onChange={onChange} />
			<footer className="flex justify-end gap-2 p-1">
				<Toggle
					variant="ghost"
					size="sm"
					className="h-6 text-muted-foreground text-xs border-none data-[state=on]:bg-transparent"
					pressed={helpOpen}
					onPressedChange={setHelpOpen}
				>
					Help {helpOpen ? 'On' : 'Off'}
				</Toggle>
				<Toggle
					variant="ghost"
					size="sm"
					className="h-6 text-xs border-none text-muted-foreground data-[state=on]:bg-transparent"
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
