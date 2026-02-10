import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

type LayoutProps = {
	children: [React.ReactNode, React.ReactNode];
};

export function Layout({ children }: LayoutProps) {
	return (
		<div className="h-full">
			<div className="md:hidden">
				<MobileLayout>{children}</MobileLayout>
			</div>
			<div className="hidden md:block h-full">
				<DesktopLayout>{children}</DesktopLayout>
			</div>
		</div>
	);
}

export function MobileLayout({ children }: LayoutProps) {
	return children;
}

export function DesktopLayout({ children }: LayoutProps) {
	return (
		<ResizablePanelGroup className="h-full" orientation="horizontal">
			<ResizablePanel defaultSize={40} minSize={20}>
				{children[0]}
			</ResizablePanel>
			<ResizableHandle className="bg-transparent" />
			<ResizablePanel className="overflow-y-scroll" defaultSize={60} minSize={20}>
				{children[1]}
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
