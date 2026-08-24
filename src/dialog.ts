import type { NormalizedEvent } from "./types.js";
import { formatDateDisplay } from "./dateUtils.js";
import { colorForType, labelForType } from "./colors.js";
import {
    canNativeShare,
    copyToClipboard,
    nativeShare,
    urlForEvent,
    xShareUrl,
} from "./share.js";

export class EventDialog {
    private dialog: HTMLDialogElement;
    private closeBtn: HTMLButtonElement;
    private icon: HTMLImageElement;
    private company: HTMLElement;
    private date: HTMLElement;
    private typePill: HTMLElement;
    private title: HTMLElement;
    private description: HTMLElement;
    private sourceLink: HTMLAnchorElement;
    private copyBtn: HTMLButtonElement;
    private nativeBtn: HTMLButtonElement;
    private xLink: HTMLAnchorElement;
    private toast: HTMLElement;

    private currentEvent: NormalizedEvent | null = null;

    constructor(private readonly onClose: () => void) {
        this.dialog = document.getElementById(
            "event-dialog",
        ) as HTMLDialogElement;
        this.closeBtn = document.getElementById(
            "dialog-close",
        ) as HTMLButtonElement;
        this.icon = document.getElementById("dialog-icon") as HTMLImageElement;
        this.company = document.getElementById("dialog-company") as HTMLElement;
        this.date = document.getElementById("dialog-date") as HTMLElement;
        this.typePill = document.getElementById("dialog-type") as HTMLElement;
        this.title = document.getElementById("dialog-title") as HTMLElement;
        this.description = document.getElementById(
            "dialog-description",
        ) as HTMLElement;
        this.sourceLink = document.getElementById(
            "dialog-source",
        ) as HTMLAnchorElement;
        this.copyBtn = document.getElementById(
            "share-copy",
        ) as HTMLButtonElement;
        this.nativeBtn = document.getElementById(
            "share-native",
        ) as HTMLButtonElement;
        this.xLink = document.getElementById("share-x") as HTMLAnchorElement;
        this.toast = document.getElementById("toast") as HTMLElement;

        this.closeBtn.addEventListener("click", () => this.dialog.close());
        this.dialog.addEventListener("cancel", () => this.onClose());
        this.dialog.addEventListener("close", () => this.onClose());
        // Clicking the backdrop closes the dialog.
        this.dialog.addEventListener("click", (e) => {
            if (e.target === this.dialog) this.dialog.close();
        });

        this.copyBtn.addEventListener("click", () => this.handleCopy());
        this.nativeBtn.addEventListener("click", () =>
            this.handleNativeShare(),
        );
        this.nativeBtn.hidden = !canNativeShare();
    }

    open(event: NormalizedEvent): void {
        this.currentEvent = event;
        const color = colorForType(event.type);

        this.icon.src = event.companyRef.icon;
        this.icon.alt = "";
        this.company.textContent = event.companyRef.name;
        this.date.textContent = formatDateDisplay(event.parsedDate);
        this.typePill.textContent = labelForType(event.type);
        this.typePill.style.setProperty("--pill-color", color);
        this.title.textContent = event.title;
        this.description.textContent = event.description;

        if (event.source) {
            this.sourceLink.href = event.source;
            this.sourceLink.hidden = false;
        } else {
            this.sourceLink.hidden = true;
        }

        const shareUrl = urlForEvent(event);
        this.xLink.href = xShareUrl(event, shareUrl);

        if (!this.dialog.open) {
            this.dialog.showModal();
        }
    }

    close(): void {
        if (this.dialog.open) this.dialog.close();
    }

    private async handleCopy(): Promise<void> {
        if (!this.currentEvent) return;
        const url = urlForEvent(this.currentEvent);
        const ok = await copyToClipboard(url);
        this.showToast(
            ok
                ? "Link copied"
                : "Couldn't copy — copy it from the address bar instead",
        );
    }

    private async handleNativeShare(): Promise<void> {
        if (!this.currentEvent) return;
        const url = urlForEvent(this.currentEvent);
        try {
            await nativeShare(this.currentEvent, url);
        } catch {
            // User cancelled the native share sheet — no action needed.
        }
    }

    private showToast(message: string): void {
        this.toast.textContent = message;
        this.toast.hidden = false;
        window.clearTimeout(this.toastTimer);
        this.toastTimer = window.setTimeout(() => {
            this.toast.hidden = true;
        }, 2200);
    }

    private toastTimer: number | undefined;
}
