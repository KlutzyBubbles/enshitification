import type { NormalizedEvent } from "./types.js";
import { formatDateDisplay } from "./dateUtils.js";
import { colorForType, labelForType } from "./colors.js";

export interface RenderRefs {
    timelineEl: HTMLOListElement;
    emptyStateEl: HTMLElement;
    template: HTMLTemplateElement;
}

export function getRenderRefs(): RenderRefs {
    const timelineEl = document.getElementById(
        "timeline",
    ) as HTMLOListElement | null;
    const emptyStateEl = document.getElementById("empty-state");
    const template = document.getElementById(
        "card-template",
    ) as HTMLTemplateElement | null;

    if (!timelineEl || !emptyStateEl || !template) {
        throw new Error("Timeline DOM scaffold is missing required elements.");
    }
    return { timelineEl, emptyStateEl, template };
}

export function renderTimeline(
    refs: RenderRefs,
    events: NormalizedEvent[],
    onSelect: (event: NormalizedEvent) => void,
): void {
    const { timelineEl, emptyStateEl, template } = refs;
    timelineEl.innerHTML = "";

    emptyStateEl.hidden = events.length > 0;
    timelineEl.hidden = events.length === 0;

    events.forEach((event) => {
        const fragment = template.content.cloneNode(true) as DocumentFragment;
        const item = fragment.querySelector<HTMLLIElement>(".timeline-item")!;
        const card = fragment.querySelector<HTMLButtonElement>(".event-card")!;
        const icon = fragment.querySelector<HTMLImageElement>(".card-icon")!;
        const company = fragment.querySelector<HTMLElement>(".card-company")!;
        const date = fragment.querySelector<HTMLElement>(".card-date")!;
        const title = fragment.querySelector<HTMLElement>(".card-title")!;
        const pill = fragment.querySelector<HTMLElement>(".card-type-pill")!;

        const color = colorForType(event.type);

        item.id = `card-${event.id}`;
        card.style.setProperty("--card-color", color);
        icon.src = event.companyRef.icon;
        icon.alt = "";
        company.textContent = event.companyRef.name;
        date.textContent = formatDateDisplay(event.parsedDate);
        date.setAttribute("datetime", event.parsedDate.toISOString());
        title.textContent = event.title;
        pill.textContent = labelForType(event.type);
        pill.style.setProperty("--card-color", color);

        card.setAttribute(
            "aria-label",
            `${event.companyRef.name}, ${formatDateDisplay(event.parsedDate)}: ${event.title}`,
        );
        card.addEventListener("click", () => onSelect(event));

        timelineEl.appendChild(fragment);
    });
}
