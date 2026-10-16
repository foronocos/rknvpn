import * as Dialog from "@radix-ui/react-dialog";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";
import { QrMark } from "@/components/qr-mark";

export function ConfigDialog({
  open,
  onOpenChange,
  uri,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uri: string;
  title: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-5 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-semibold text-fg">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                Строка для импорта в клиент. Канал в браузере только симулируется.
              </Dialog.Description>
            </div>
            <Dialog.Close className="tap rounded-lg p-2 text-muted hover:text-fg" aria-label="Закрыть">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <p className="mb-4 max-h-28 overflow-auto rounded-xl border border-line bg-bg p-3 font-mono text-xs break-all text-cyan">
            {uri}
          </p>
          <QrMark value={uri} />
          <button
            type="button"
            className="tap mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan font-semibold text-ink"
            onClick={() => {
              void navigator.clipboard.writeText(uri).then(
                () => toast.success("Скопировано в буфер"),
                () => toast.error("Не удалось скопировать"),
              );
            }}
          >
            <Copy className="size-4" />
            Скопировать
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
